"use client";

import { WeekdayEnum } from "@/enums/weekday.enum";
import clsx from "clsx";
import { HOURS } from "@/constants/hours.const";
import CourseBlock from "./CourseBlock";
import { PersonalScheduleRenderInfoType } from "@/types/personalScheduleRender.type";
import PersonalScheduleBlock from "./PersonalScheduleBlock";
import { CourseTimetableRenderType } from "@/types/course_timetable_render.type";
import HoveredCourseBlock from "./HoveredCourseBlock";

type Props = {
  day: WeekdayEnum;
  coursesInCurDay?: CourseTimetableRenderType[];
  personalSchedulesInCurDay?: PersonalScheduleRenderInfoType[];
  isCPSATResult: boolean;
  timetableCellHeight: number;
};

export default function DayColumn({
  day,
  coursesInCurDay,
  personalSchedulesInCurDay,
  isCPSATResult,
  timetableCellHeight,
}: Props) {
  return (
    <td data-day={day} className="relative">
      {HOURS.map((hour, i) => (
        <div
          key={hour}
          className={clsx(
            "min-w-20",
            i !== 0 && "border-timetable-cell-border border-t",
          )}
          style={{
            height: `${timetableCellHeight}px`,
          }}
        />
      ))}

      {!isCPSATResult && <HoveredCourseBlock day={day} />}

      {coursesInCurDay &&
        coursesInCurDay.map((courseInCurDay) => (
          <CourseBlock
            key={`${courseInCurDay.id}-${day}`}
            courseRenderInfo={courseInCurDay}
            isCPSATResult={isCPSATResult}
            isHoveredCourse={false}
          />
        ))}

      {personalSchedulesInCurDay &&
        personalSchedulesInCurDay.map((personalScheduleInCurDay, i) => (
          <PersonalScheduleBlock
            key={`${personalScheduleInCurDay.personalScheduleId}-${day}-${i}`}
            personalScheduleRenderInfo={personalScheduleInCurDay}
            isCPSATResult={isCPSATResult}
          />
        ))}
    </td>
  );
}
