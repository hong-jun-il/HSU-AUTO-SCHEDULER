import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { SemesterEntity } from 'src/common/entities/01_semester.entity';
import { MajorEntity } from 'src/common/entities/02_major.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PersistenceService } from './persistence.service';
import { SemesterDto } from 'src/common/dto/semester.dto';
import { MajorDto } from 'src/common/dto/major.dto';
import { SemesterMajorEntity } from 'src/common/entities/03_semester_major.entity';
import { CourseDto } from 'src/common/dto/course.dto';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(SemesterEntity)
    private readonly semesterRepo: Repository<SemesterEntity>,

    @InjectRepository(MajorEntity)
    private readonly majorRepo: Repository<MajorEntity>,

    @InjectRepository(SemesterMajorEntity)
    private readonly semesterMajorRepo: Repository<SemesterMajorEntity>,

    private readonly persistenceService: PersistenceService,
  ) {}

  async createSemester(semester: SemesterDto) {
    let semesterEntity = await this.semesterRepo.findOne({
      where: { year: semester.year, term: semester.term },
    });

    if (!semesterEntity) {
      semesterEntity = this.semesterRepo.create({
        id: `${semester.year}-${semester.term}`,
        year: semester.year,
        term: semester.term,
      });
      semesterEntity = await this.semesterRepo.save(semesterEntity);
    }

    return {
      message: `${semester.year}-${semester.term}학기 처리 완료`,
      data: semesterEntity,
    };
  }

  // 학기-전공, 전공 테이블 저장
  async createMajors(semesterId: string, majors: MajorDto[]) {
    const majorCodes = majors.map((m) => m.code);
    const existingMajors = await this.majorRepo.find({
      where: { code: In(majorCodes) },
    });

    const existingCodeSet = new Set(existingMajors.map((m) => m.code));
    const newMajors = majors.filter((m) => !existingCodeSet.has(m.code));

    let allMajors = [...existingMajors];
    if (newMajors.length > 0) {
      const insertResult = await this.majorRepo.insert(newMajors);

      const newlyCreated = await this.majorRepo.find({
        where: { id: In(insertResult.identifiers.map((i) => i.id)) },
      });
      allMajors = [...allMajors, ...newlyCreated];
    }

    const semesterMajorLinks = allMajors.map((major) => ({
      semester_id: semesterId,
      major_id: major.id,
    }));

    await this.semesterMajorRepo.upsert(semesterMajorLinks, {
      conflictPaths: ['semester_id', 'major_id'],
      skipUpdateIfNoValuesChanged: true,
    });

    return {
      message: `전공 데이터 ${majors.length}건 업데이트 완료`,
    };
  }

  // 강의 저장 트랜잭션(강의, 전공-강의, 분반, 오프라인 스케줄)
  async createCourseTransaction(
    semesterId: string,
    major: MajorDto,
    courses: CourseDto[],
  ) {
    const [semesterEntity, majorEntity] = await Promise.all([
      this.semesterRepo.findOneByOrFail({
        id: semesterId,
      }),
      this.majorRepo.findOneByOrFail({ code: major.code }),
    ]);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const courseEntities = await this.persistenceService.bulkUpsertCourses(
        queryRunner,
        courses,
      );

      const courseIdMap = new Map<string, string>(
        courseEntities.map((c) => [c.code, c.id]),
      );

      await this.persistenceService.bulkUpsertMajorCourse(
        queryRunner,
        courses,
        majorEntity,
        courseIdMap,
      );

      const lectureEntities =
        await this.persistenceService.bulkInsertIntoLectureTable(
          queryRunner,
          semesterEntity,
          courseIdMap,
          courses,
        );

      await this.persistenceService.bulkInsertIntoOfflineScheduleTable(
        queryRunner,
        lectureEntities,
        courses,
        courseIdMap,
      );

      await queryRunner.commitTransaction();
      return {
        message: `${semesterEntity.year}년 ${semesterEntity.term}학기 ${majorEntity.name} 강의 목록 ${courses.length}개 저장 성공`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
