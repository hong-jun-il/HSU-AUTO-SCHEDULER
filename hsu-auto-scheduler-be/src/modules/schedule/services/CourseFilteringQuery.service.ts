// import { Injectable } from '@nestjs/common';
// import { CourseEntity } from 'src/common/entities/04_course.entity';
// import { WeekdayEnum } from 'src/common/enums/weekday.enum';
// import { SelectQueryBuilder } from 'typeorm';
// import { WeeklyScheduleType } from './schedule.service';
// import { PersonalScheduleDto } from '../dto/personalSchedule.dto';
// import { CourseDto } from 'src/common/dto/course.dto';

// type QueryFilterType = {
//   clause: any;
//   params: any;
// };

// @Injectable()
// export class CourseFilteringQueryService {
//   // sql: 학기 필터링
//   getCoursesBySemester(
//     classSectionRepoAlias: string,
//     semesterId: string,
//   ): QueryFilterType {
//     return {
//       clause: `${classSectionRepoAlias}.semester_id = :semesterId`,
//       params: { semesterId },
//     };
//   }

//   // sql: 전공 필터링
//   getCoursesByMajor(
//     classSectionRepoAlias: string,
//     major_code: string,
//   ): QueryFilterType {
//     return {
//       clause: (qb: SelectQueryBuilder<CourseEntity>) => {
//         const subQuery = qb
//           .subQuery()
//           .select('1')
//           .from('major_course', 'mc')
//           .where(`mc.course_code = ${classSectionRepoAlias}.course_code`)
//           .andWhere('mc.major_code = :major_code')
//           .getQuery();

//         return `EXISTS ${subQuery}`;
//       },
//       params: {
//         major_code,
//       },
//     };
//   }

//   // sql: 검색어 필터링(CPSAT 연산이 아닌 강의 조회에만)
//   getCoursesBySearch(
//     classSectionRepoAlias: string,
//     courseRepoAlias: string,
//     search: string,
//   ): QueryFilterType {
//     return {
//       clause: `(${classSectionRepoAlias}.course_code LIKE :search OR ${courseRepoAlias}.course_name LIKE :search OR ${classSectionRepoAlias}.professor_names LIKE :search)`,
//       params: { search: `%${search}%` },
//     };
//   }

//   // sql: 주야 필터링
//   getCoursesByDayOrNight(
//     classSectionRepoAlias: string,
//     day_or_night: string,
//   ): QueryFilterType {
//     return {
//       clause: `${classSectionRepoAlias}.day_or_night IN (:...day_or_night)`,
//       params: { day_or_night: [day_or_night, 'both'] },
//     };
//   }

//   // sql: 공강 요일 필터링(offline schedule이 조인되어 있을 시)
//   getCoursesByNoClassDays(
//     offlineScheduleRepoAlias: string,
//     no_class_days: WeekdayEnum[],
//   ): QueryFilterType {
//     return {
//       clause: `(${offlineScheduleRepoAlias}.day NOT IN (:...excludeDays) OR ${offlineScheduleRepoAlias}.course_code IS NULL)`,
//       params: {
//         excludeDays: no_class_days,
//       },
//     };
//   }

//   // sql: 미리 선택된 강의 필터링(강의 코드로 같은 이름의 강의를 거름)
//   // 미리 선택된 강의들을 개인 스케줄로 취급하여 weeklyScheduleMap에 요일별로 추가(해당 강의의 시간대와 겹치는 다른 강의를 거르기 위해)
//   getCoursesByPreSelectedCourses(
//     courseRepoAlias: string,
//     selected_courses: CourseDto[],
//     weeklyScheduleMap: Map<WeekdayEnum, WeeklyScheduleType[]>,
//   ): QueryFilterType {
//     const query: QueryFilterType = {
//       clause: `${courseRepoAlias}.course_code NOT IN (:...selected_course_codes)`,
//       params: {
//         selected_course_codes: selected_courses.map((selected) => {
//           const selected_course_schedules = selected.offline_schedules;

//           selected_course_schedules.forEach((cur_schedule) => {
//             const { day, ...rest } = cur_schedule;

//             const newWeeklySchedule: WeeklyScheduleType = {
//               schedule_name: selected.course_name,
//               start_time: rest.start_time,
//               end_time: rest.end_time,
//             };

//             const currentSchedules = weeklyScheduleMap.get(day) ?? [];

//             currentSchedules.push(newWeeklySchedule);

//             weeklyScheduleMap.set(day, currentSchedules);
//           });

//           return selected.course_code;
//         }),
//       },
//     };

//     return query;
//   }

//   // js: weeklyScheduleMap에 요일별로 개인 스케줄을 추가
//   getCoursesByPersonalSchedulesFilter(
//     personal_schedules: PersonalScheduleDto[],
//     no_class_days: WeekdayEnum[],
//     weeklyScheduleMap: Map<WeekdayEnum, WeeklyScheduleType[]>,
//   ) {
//     const noClassDaysSet = new Set(no_class_days);

//     personal_schedules.forEach((personal_schedule) => {
//       personal_schedule.offline_schedules.forEach((offlineSchedule) => {
//         const { day } = offlineSchedule;

//         const baseInfo: WeeklyScheduleType = {
//           schedule_name: personal_schedule.personal_schedule_name,
//           start_time: offlineSchedule.start_time,
//           end_time: offlineSchedule.end_time,
//         };

//         // 해당 스케줄이 공강 요일에 포함되지 않는다면 weeklyScheduleMap에 추가
//         if (!noClassDaysSet.has(day)) {
//           weeklyScheduleMap.has(day)
//             ? weeklyScheduleMap.get(day)!.push(baseInfo)
//             : weeklyScheduleMap.set(day, [baseInfo]);
//         }
//       });
//     });
//   }

//   getCoursesFilterByWeeklySchedule(
//     courses: CourseDto[],
//     weeklyScheduleMap: Map<WeekdayEnum, WeeklyScheduleType[]>,
//   ): CourseDto[] {
//     courses = courses.filter((course) => {
//       return course.offline_schedules.every((curCourseCurOfflineSchedule) => {
//         const curCourseCurOfflineScheduleDay = curCourseCurOfflineSchedule.day;
//         if (!weeklyScheduleMap.has(curCourseCurOfflineScheduleDay)) {
//           return true;
//         }

//         return weeklyScheduleMap
//           .get(curCourseCurOfflineScheduleDay)!
//           .every((curWeeklySchedule: WeeklyScheduleType) => {
//             const cur_course_schedule_start_time =
//               curCourseCurOfflineSchedule.start_time;
//             const cur_course_schedule_end_time =
//               curCourseCurOfflineSchedule.end_time;

//             const cur_weekly_schedule_start_time = curWeeklySchedule.start_time;
//             const cur_weekly_schedule_end_time = curWeeklySchedule.end_time;

//             if (
//               cur_course_schedule_start_time < cur_weekly_schedule_end_time &&
//               cur_course_schedule_end_time > cur_weekly_schedule_start_time
//             ) {
//               // console.log(
//               //   `${course.course_name}-${course.course_id} 요일: ${curCourseCurOfflineScheduleDay} 시작시간: ${cur_course_schedule_start_time} 종료시간: ${cur_course_schedule_end_time} 걸러짐`,
//               // );
//               return false;
//             }

//             return true;
//           });
//       });
//     });
//     return courses;
//   }

//   // js: 점심 시간 필터링
//   getCoursesByLunchTimeFilter(courses: CourseDto[]): CourseDto[] {
//     const lunchStart = 720; // 12:00
//     const lunchEnd = 780; // 13:00

//     courses = courses.filter((course) => {
//       return course.offline_schedules.every((cur_course_offline_schedule) => {
//         const cur_course_offline_schedule_start_time =
//           cur_course_offline_schedule.start_time;
//         const cur_course_offline_schedule_end_time =
//           cur_course_offline_schedule.end_time;

//         if (
//           cur_course_offline_schedule_start_time < lunchEnd &&
//           cur_course_offline_schedule_end_time > lunchStart
//         ) {
//           return false;
//         }

//         return true;
//       });
//     });

//     return courses;
//   }
// }
