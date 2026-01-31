import { Injectable } from '@nestjs/common';
import { SemesterEntity } from 'src/common/entities/01_semester.entity';
import { MajorEntity } from 'src/common/entities/02_major.entity';
import { CourseEntity } from 'src/common/entities/04_course.entity';
import { OfflineScheduleEntity } from 'src/common/entities/07_offlineSchedule.entity';
import { In, QueryRunner } from 'typeorm';
import { MajorCourseEntity } from 'src/common/entities/05_major_course.entity';
import { LectureEntity } from 'src/common/entities/06_lecture.entity';
import { CourseDto } from 'src/common/dto/course.dto';
import { LoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class PersistenceService {
  constructor(private readonly logger: LoggerService) {}

  // course table 저장 메서드
  async bulkUpsertCourses(
    queryRunner: QueryRunner,
    courses: CourseDto[],
  ): Promise<CourseEntity[]> {
    const courseData = courses.map((course) => ({
      code: course.code,
      name: course.name,
      credit: course.credit,
    }));

    await queryRunner.manager.upsert(CourseEntity, courseData, {
      conflictPaths: ['code'],
      skipUpdateIfNoValuesChanged: true,
    });

    return queryRunner.manager.findBy(CourseEntity, {
      code: In(courses.map((course) => course.code)),
    });
  }

  // major-courses table 저장 메서드
  async bulkUpsertMajorCourse(
    queryRunner: QueryRunner,
    courses: CourseDto[],
    majorEntity: MajorEntity,
    courseIdMap: Map<string, string>,
  ) {
    const majorCourseData = courses.map((course) => {
      const courseId = courseIdMap.get(course.code);

      return {
        major_id: majorEntity.id,
        course_id: courseId,
        requirement_type: course.requirement_type,
        grade: course.grade,
        grade_limit: course.grade_limit,
      };
    });

    if (majorCourseData.length === 0) {
      return;
    }

    await queryRunner.manager.upsert(MajorCourseEntity, majorCourseData, {
      conflictPaths: ['major_id', 'course_id'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  // lecture table 저장 메서드
  async bulkInsertIntoLectureTable(
    queryRunner: QueryRunner,
    semesterEntity: SemesterEntity,
    courseIdMap: Map<string, string>,
    courses: CourseDto[],
  ): Promise<LectureEntity[]> {
    const lectureData = courses.map((c) => {
      const courseId = courseIdMap.get(c.code);

      return {
        semester_id: semesterEntity.id,
        course_id: courseId,
        section: c.section,
        delivery_method: c.delivery_method,
        day_or_night: c.day_or_night,
        professors: c.professors,
        online_hour: c.online_hour,
        plan_code: c.plan_code,
        remark: c.remark,
      };
    });

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(LectureEntity)
      .values(lectureData)
      .orIgnore()
      .execute();

    const lectureEntities = await queryRunner.manager.find(LectureEntity, {
      where: lectureData.map((data) => ({
        section: data.section,
        semester_id: data.semester_id,
        course_id: data.course_id,
      })),
    });

    return lectureEntities;
  }

  // offline schedule table 저장 메서드
  async bulkInsertIntoOfflineScheduleTable(
    queryRunner: QueryRunner,
    lectureEntities: LectureEntity[],
    courses: CourseDto[],
    courseIdMap: Map<string, string>,
  ) {
    const lectureIdMap = new Map<string, string>();
    lectureEntities.forEach((l) => {
      lectureIdMap.set(`${l.course_id}_${l.section}`, l.id);
    });

    // courses를 돌면서 code와 section으로 lecture 엔티티의 id를 알아야 함
    // code를 통해 course의 id를 얻고 lecture에서 course id와 section이 같은 것을 통해
    // lecture 아이디를 얻음
    const scheduleData = courses.flatMap((course) => {
      const courseId = courseIdMap.get(course.code);
      // 2. 객체가 아닌 ID(string)를 가져옴
      const targetLectureId = lectureIdMap.get(`${courseId}_${course.section}`);

      if (!course.offline_schedules || course.offline_schedules.length === 0) {
        return [];
      }

      return course.offline_schedules.map((schedule) => ({
        lecture_id: targetLectureId,
        day: schedule.day,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        place: schedule.place,
      }));
    });

    if (scheduleData.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(OfflineScheduleEntity)
        .values(scheduleData)
        .orIgnore()
        .execute();
    }
  }
}
