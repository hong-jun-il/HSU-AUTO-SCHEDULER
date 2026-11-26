"use client";

import { useMemo } from "react";
import { WeekdayEnum } from "@/enums/weekday.enum";
import { useHoveredCourseStore } from "@/store/hoveredCourse/hoveredCourseStore";
import { CourseTimetableRenderType } from "@/types/course_timetable_render.type";
import { getTopByStartTime } from "@/utils/getTopByStartTime";
import { getBlockHeight } from "@/utils/getBlockHeight";
import CourseBlock from "./CourseBlock";

type Props = {
  day: WeekdayEnum;
};

// 마우스를 올린 강의를 해당 요일 칸에 미리 보여주는 블록
export default function HoveredCourseBlock({ day }: Props) {
  // 이 요일에 수업이 있을 때만 강의를 고른다
  // 그래서 마우스를 옮겨도 미리보기가 생기거나 사라지는 요일만 다시 그려진다
  const hoveredCourse = useHoveredCourseStore((state) =>
    state.hoveredCourse?.offline_schedules.some((os) => os.day === day)
      ? state.hoveredCourse
      : null,
  );

  const renderInfo: CourseTimetableRenderType | null = useMemo(() => {
    if (!hoveredCourse) return null;

    // 같은 요일에 수업이 여러 번이면 첫 수업만 보여준다
    const offlineSchedule = hoveredCourse.offline_schedules.find(
      (os) => os.day === day,
    );
    if (!offlineSchedule) return null;

    return {
      id: hoveredCourse.id,
      name: hoveredCourse.name,
      section: hoveredCourse.section,
      professors: hoveredCourse.professors,
      colorIndex: 0,
      offlineSchedule,
      top: getTopByStartTime(offlineSchedule.start_time, false),
      height: getBlockHeight(
        offlineSchedule.start_time,
        offlineSchedule.end_time,
        false,
      ),
    };
  }, [hoveredCourse, day]);

  if (!renderInfo) return null;

  return (
    <CourseBlock
      courseRenderInfo={renderInfo}
      isCPSATResult={false}
      isHoveredCourse={true}
    />
  );
}
