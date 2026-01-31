import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WeekdayEnum } from 'src/common/enums/weekday.enum';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SemesterEntity } from 'src/common/entities/01_semester.entity';
import { MajorEntity } from 'src/common/entities/02_major.entity';
import { CourseEntity } from 'src/common/entities/04_course.entity';
import { LectureEntity } from 'src/common/entities/06_lecture.entity';
import { CourseViewDto } from '../dto/course-view.dto';
import { FilterDto } from '../dto/filter.dto';
import { ConstraintsDto } from '../dto/constraints.dto';
import { CPSATFilterDto } from '../dto/cpsat-filter.dto';
import { DayOrNightEnum } from 'src/common/enums/day_or_night.enum';

export type WeeklyScheduleType = {
  schedule_name: string;
  start_time: number;
  end_time: number;
};

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(SemesterEntity)
    private readonly semesterRepo: Repository<SemesterEntity>,

    @InjectRepository(MajorEntity)
    private readonly majorRepo: Repository<MajorEntity>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    @InjectRepository(LectureEntity)
    private readonly lectureRepo: Repository<LectureEntity>,

    private readonly httpService: HttpService,

    // private readonly courseFilterQueryService: CourseFilteringQueryService,
  ) {}

  filterByWeeklyScheduleMap(
    lectures: LectureEntity[],
    weeklyScheduleMap: Map<WeekdayEnum, WeeklyScheduleType[]>,
  ): LectureEntity[] {
    lectures = lectures.filter((lecture) => {
      return lecture.offline_schedules.every((os) => {
        const { day, start_time: lectureStart, end_time: lectureEnd } = os;

        const daySchedule = weeklyScheduleMap.get(day);

        if (!daySchedule || daySchedule.length === 0) {
          return true;
        }

        return daySchedule.every((schedule) => {
          const { start_time: dayScheduleStart, end_time: dayScheduleEnd } =
            schedule;
          const isNotOverlapping =
            lectureStart >= dayScheduleEnd || lectureEnd <= dayScheduleStart;

          return isNotOverlapping;
        });
      });
    });

    return lectures;
  }

  // 모든 학년-학기를 조회하는 함수
  async getSemesters() {
    const semesters = await this.semesterRepo.find();

    semesters.sort((a, b) => b.year - a.year || b.term - a.term);
    return {
      message: 'get semesters 성공',
      data: semesters,
    };
  }

  // 학기에 맞는 모든 전공을 가져오는 함수
  async getMajors(semesterId: string) {
    const majors = await this.majorRepo
      .createQueryBuilder('m')
      .innerJoin('semester_major', 'sm', 'm.id = sm.major_id')
      .where('sm.semester_id = :semesterId', {
        semesterId: semesterId,
      })
      .select(['m.id', 'm.code', 'm.name'])
      .getMany();

    return {
      message: 'get majors 성공',
      data: majors,
    };
  }

  /**
    SQL filters
      1. 학기
      2. 전공
      3. 검색어
      4. 학년
      5. 주야
      6. 공강 요일
      7. 선택된 강의의 과목 코드

    JS filters
      8. 선택된 강의의 시간대(Map에 추가 후 한꺼번에 필터링)
      9. 선택된 개인 스케줄의 시간대(Map에 추가 후 한꺼번에 필터링)
      10. 점심 시간(12:00 ~ 13:00)
  */
  async getCourses(
    currentPage: number,
    pagePerLimit: number,
    filters: FilterDto,
  ) {
    const {
      semester_id,
      major_id,
      search,
      grade,
      day_or_night,
      no_class_days,
      selected_courses,
      personal_schedules,
      has_lunch_break,
    } = filters;

    const weeklyScheduleMap = new Map<WeekdayEnum, WeeklyScheduleType[]>();

    const query = this.lectureRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.course', 'c')
      .leftJoinAndSelect('c.major_course', 'mc')
      .leftJoinAndSelect('mc.major', 'm')
      .leftJoinAndSelect('l.offline_schedules', 'os')
      // SQL: 1. 학기 필터링
      .where('l.semester_id = :semester_id', { semester_id });

    // SQL: 2. 전공 필터링
    if (major_id) {
      query.andWhere('m.id = :major_id', { major_id });
    }

    // SQL: 3. 검색어 필터링
    if (search) {
      query.andWhere(
        '(c.code LIKE :search OR c.name LIKE :search OR l.professors LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // SQL: 4. 학년 필터링
    if (grade) {
      query.andWhere('mc.grade IN (:...grades)', {
        grades: [0, grade],
      });
    }

    // SQL: 5. 주야 필터링
    if (day_or_night) {
      query.andWhere('l.day_or_night IN (:...day_or_night)', {
        day_or_night: [DayOrNightEnum.BOTH, day_or_night],
      });
    }

    // SQL: 6. 공강 요일 필터링
    if (no_class_days.length > 0) {
      query.andWhere(
        '(os.day NOT IN (:...excludeDays) OR os.lecture_id IS NULL)',
        {
          excludeDays: no_class_days,
        },
      );
    }

    // SQL: 7. 선택된 강의의 과목코드 필터링
    // JS: 8. WeeklyScheduleMap에 해당 강의의 스케줄 추가
    if (selected_courses.length > 0) {
      query.andWhere('c.code NOT IN (:...selected_course_codes)', {
        selected_course_codes: selected_courses.map((course) => {
          course.offline_schedules.forEach((schedule) => {
            const { day, start_time, end_time } = schedule;

            const newDaySchedule = weeklyScheduleMap.get(day) ?? [];

            newDaySchedule.push({
              schedule_name: course.name,
              start_time,
              end_time,
            });

            weeklyScheduleMap.set(day, newDaySchedule);
          });

          return course.code;
        }),
      });
    }

    // JS: 9. Personal Schedule을 WeeklyScheduleMap에 추가
    if (personal_schedules.length > 0) {
      const noClassDaysSet = new Set(no_class_days);

      personal_schedules.forEach((ps) => {
        ps.offline_schedules.forEach((schedule) => {
          const { day, start_time, end_time } = schedule;

          // 해당 스케줄이 공강 요일에 포함되지 않는다면 weeklyScheduleMap에 추가
          // 공강 요일에 스케줄이 포함된다면 굳이 추가하여 JS로 필터링 할 이유가 없음
          if (!noClassDaysSet.has(day)) {
            const newDaySchedule = weeklyScheduleMap.get(day) ?? [];

            newDaySchedule.push({
              schedule_name: ps.personal_schedule_name,
              start_time,
              end_time,
            });

            weeklyScheduleMap.set(day, newDaySchedule);
          }
        });
      });
    }

    let result = await query.getMany();

    // JS: Map에 추가된 스케줄들과 겹치는 시간 필터링
    result = this.filterByWeeklyScheduleMap(result, weeklyScheduleMap);

    // JS: 10. 점심 시간 필터링
    if (has_lunch_break) {
      const lunchStart = 12 * 60;
      const lunchEnd = 13 * 60;

      result = result.filter((lecture) => {
        return lecture.offline_schedules.every((os) => {
          const { start_time, end_time } = os;

          const isNotOverlapping =
            start_time >= lunchEnd || end_time <= lunchStart;

          return isNotOverlapping;
        });
      });
    }

    const paginationStart = (currentPage - 1) * pagePerLimit;
    const paginationEnd = paginationStart + pagePerLimit;

    const data: CourseViewDto[] = result
      .slice(paginationStart, paginationEnd)
      .map((lecture) => {
        return {
          id: lecture.id,
          course_id: lecture.course_id,
          code: lecture.course.code,
          name: lecture.course.name,
          credit: lecture.course.credit,
          requirement_types: [
            ...new Set(
              lecture.course.major_course.map((mc) => mc.requirement_type),
            ),
          ],
          grades: [
            ...new Set(
              lecture.course.major_course
                .map((mc) => mc.grade)
                .sort((a, b) => a - b),
            ),
          ],
          grade_limits: [
            ...new Set(
              lecture.course.major_course
                .map((mc) => mc.grade_limit)
                .filter((gl): gl is number => gl !== null)
                .sort((a, b) => a - b),
            ),
          ],
          section: lecture.section,
          delivery_method: lecture.delivery_method,
          day_or_night: lecture.day_or_night,
          professors: lecture.professors,
          online_hour: lecture.online_hour,
          plan_code: lecture.plan_code,
          remark: lecture.remark,
          offline_schedules: lecture.offline_schedules,
        };
      });

    return {
      message: `강의 데이터 ${result.length}개 조회 성공`,
      data: {
        courses: data,
        totalCount: data.length,
      },
    };
  }

  // getCourses와 search를 제외한건 동일함
  // 중복되는 로직이 많으니 캐싱 등 구조 개선 필요
  async getCPSATResult(
    currentPage: number,
    pagePerLimit: number,
    filters: CPSATFilterDto,
    constraints: ConstraintsDto,
  ) {
    const {
      semester_id,
      major_id,
      grade,
      day_or_night,
      no_class_days,
      selected_courses,
      personal_schedules,
      has_lunch_break,
    } = filters;

    const weeklyScheduleMap = new Map<WeekdayEnum, WeeklyScheduleType[]>();

    const query = this.lectureRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.course', 'c')
      .leftJoinAndSelect('c.major_course', 'mc')
      .leftJoinAndSelect('mc.major', 'm')
      .leftJoinAndSelect('l.offline_schedules', 'os')
      // SQL: 1. 학기 필터링
      .where('l.semester_id = :semester_id', { semester_id })
      // SQL: 2. 전공 필터링
      .andWhere('m.id = :major_id', { major_id })
      // SQL: 3. 학년 필터링
      .andWhere('mc.grade IN (:...grades)', {
        grades: [0, grade],
      })
      // SQL: 4. 주야 필터링
      .andWhere('l.day_or_night IN (:...day_or_night)', {
        day_or_night: [DayOrNightEnum.BOTH, day_or_night],
      });

    // SQL: 5. 공강 요일 필터링
    if (no_class_days.length > 0) {
      query.andWhere(
        '(os.day NOT IN (:...excludeDays) OR os.lecture_id IS NULL)',
        {
          excludeDays: no_class_days,
        },
      );
    }

    // SQL: 6. 선택된 강의의 과목코드 필터링
    // JS: 7. WeeklyScheduleMap에 해당 강의의 스케줄 추가
    if (selected_courses.length > 0) {
      query.andWhere('c.code NOT IN (:...selected_course_codes)', {
        selected_course_codes: selected_courses.map((course) => {
          course.offline_schedules.forEach((schedule) => {
            const { day, start_time, end_time } = schedule;

            const newDaySchedule = weeklyScheduleMap.get(day) ?? [];

            newDaySchedule.push({
              schedule_name: course.name,
              start_time,
              end_time,
            });

            weeklyScheduleMap.set(day, newDaySchedule);
          });

          return course.code;
        }),
      });
    }

    // JS: 8. Personal Schedule을 WeeklyScheduleMap에 추가
    if (personal_schedules.length > 0) {
      const noClassDaysSet = new Set(no_class_days);

      personal_schedules.forEach((ps) => {
        ps.offline_schedules.forEach((schedule) => {
          const { day, start_time, end_time } = schedule;

          // 해당 스케줄이 공강 요일에 포함되지 않는다면 weeklyScheduleMap에 추가
          // 공강 요일에 스케줄이 포함된다면 굳이 추가하여 JS로 필터링 할 이유가 없음
          if (!noClassDaysSet.has(day)) {
            const newDaySchedule = weeklyScheduleMap.get(day) ?? [];

            newDaySchedule.push({
              schedule_name: ps.personal_schedule_name,
              start_time,
              end_time,
            });

            weeklyScheduleMap.set(day, newDaySchedule);
          }
        });
      });
    }

    let result = await query.getMany();

    // JS: Map에 추가된 스케줄들과 겹치는 시간 필터링
    result = this.filterByWeeklyScheduleMap(result, weeklyScheduleMap);

    // JS: 9. 점심 시간 필터링
    if (has_lunch_break) {
      const lunchStart = 12 * 60;
      const lunchEnd = 13 * 60;

      result = result.filter((lecture) => {
        return lecture.offline_schedules.every((os) => {
          const { start_time, end_time } = os;

          const isNotOverlapping =
            start_time >= lunchEnd || end_time <= lunchStart;

          return isNotOverlapping;
        });
      });
    }

    const data: CourseViewDto[] = [
      ...selected_courses,
      ...result.map((lecture) => {
        return {
          id: lecture.id,
          course_id: lecture.course_id,
          code: lecture.course.code,
          name: lecture.course.name,
          credit: lecture.course.credit,
          requirement_types: [
            ...new Set(
              lecture.course.major_course.map((mc) => mc.requirement_type),
            ),
          ],
          grades: [
            ...new Set(
              lecture.course.major_course
                .map((mc) => mc.grade)
                .sort((a, b) => a - b),
            ),
          ],
          grade_limits: [
            ...new Set(
              lecture.course.major_course
                .map((mc) => mc.grade_limit)
                .filter((gl): gl is number => gl !== null)
                .sort((a, b) => a - b),
            ),
          ],
          section: lecture.section,
          delivery_method: lecture.delivery_method,
          day_or_night: lecture.day_or_night,
          professors: lecture.professors,
          online_hour: lecture.online_hour,
          plan_code: lecture.plan_code,
          remark: lecture.remark,
          offline_schedules: lecture.offline_schedules,
        };
      }),
    ];

    const response = await firstValueFrom(
      this.httpService.post(`${process.env.FAST_API_BASE_URL}/cp-sat`, {
        filtered_data: data,
        // 밑의 강의들은 무조건 포함되도록 하기 위해서 같이 보냄
        pre_selected_courses: selected_courses,
        constraints,
      }),
    );

    const { total_solution_count, solutions } = response.data;

    const paginationStart = (currentPage - 1) * pagePerLimit;
    const paginationEnd = paginationStart + pagePerLimit;

    const slicedSolutions = solutions.slice(paginationStart, paginationEnd);

    return {
      message: '필터링 및 제약 조건 추출 성공',
      data: {
        total_solution_count,
        solutions: slicedSolutions,
      },
    };
  }
}
