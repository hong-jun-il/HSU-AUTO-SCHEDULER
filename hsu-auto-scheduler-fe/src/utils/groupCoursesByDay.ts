// 시간표 렌더링에 필요한 강의 정보를 요알을 기준으로 묶어주는 함수

import {
  CourseTimetableRenderType,
  SelectedCoursesByDayType,
} from "@/types/course_timetable_render.type";
import { getTopByStartTime } from "./getTopByStartTime";
import { getBlockHeight } from "./getBlockHeight";
import { COURSE_BLOCK_BG_COLORS } from "@/constants/block-colors.const";
import { CourseType } from "@/types/schemas/course.schema";

export default function groupCoursesByDay(
  courses: CourseType[],
  isCPSATResult: boolean,
): SelectedCoursesByDayType {
  const groupedCoursesByDay: SelectedCoursesByDayType = courses.reduce(
    (acc, course, index) => {
      const baseInfo: CourseTimetableRenderType = {
        id: course.id,
        name: course.name,
        section: course.section,
        professors: course.professors,
        colorIndex: 0,
      };

      if (course.offline_schedules.length === 0) {
        const newNonTimes = acc["nontimes"] ?? [];
        newNonTimes.push(baseInfo);

        acc["nontimes"] = newNonTimes;
      } else {
        course.offline_schedules.forEach((offlineSchedule) => {
          const day = offlineSchedule.day;

          const newCoursesInCurDay = acc[day] ?? [];

          newCoursesInCurDay.push({
            ...baseInfo,
            colorIndex: (index % (COURSE_BLOCK_BG_COLORS.length - 1)) + 1,
            offlineSchedule,
            top: getTopByStartTime(offlineSchedule.start_time, isCPSATResult),
            height: getBlockHeight(
              offlineSchedule.start_time,
              offlineSchedule.end_time,
              isCPSATResult,
            ),
          });

          acc[day] = newCoursesInCurDay;
        });
      }

      return acc;
    },
    {} as SelectedCoursesByDayType,
  );

  return groupedCoursesByDay;
}
