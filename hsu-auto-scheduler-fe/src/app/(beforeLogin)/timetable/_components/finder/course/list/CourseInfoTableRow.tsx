// 데스크탑 전용 테이블 row

"use client";

import { DayOrNightKorMap } from "@/enums/day_or_night.enum";
import {
  DeliveryMethodEnum,
  DeliveryMethodKorMap,
} from "@/enums/delivery_method.enum";
import { RequirementTypeKorMap } from "@/enums/requirement_type.enum";
import { CourseType } from "@/types/schemas/course.schema";
import { formatOfflineScheduleView } from "@/utils/format_offline_schedule_view";
import openLecturePlan from "@/utils/openLecturePlan";
import clsx from "clsx";

type Props = {
  course: CourseType;
  setHoveredCourse: (course: CourseType) => void;
  clearHoveredCourse: () => void;
  onClickCourse: (course: CourseType) => void;
};

export default function CourseInfoTableRow({
  course,
  setHoveredCourse,
  clearHoveredCourse,
  onClickCourse,
}: Props) {
  return (
    <tr
      className={clsx(
        "cursor-pointer bg-white text-xs",
        "hover:bg-course-finder-courses-table-row-hover-bg",
      )}
      onMouseEnter={() => setHoveredCourse(course)}
      onMouseLeave={clearHoveredCourse}
      onClick={() => onClickCourse(course)}
    >
      <td>
        <span className="text-hsu bg-hsu/20 rounded-lg p-3 font-semibold">{`${course.code}-${course.section}`}</span>
      </td>

      <td className="text-hsu font-semibold">{course.name}</td>

      <td className="text-hsu-black-300 font-medium">{course.professors}</td>

      <td className="bg-hsu/20 text-hsu font-semibold">
        {course.grades
          .map((grade) => (grade === 0 ? "전학년" : grade))
          .join("/")}
      </td>

      <td className="text-course-info-text-base-gray font-medium">
        {course.grade_limits.length > 0 ? course.grade_limits.join(", ") : "-"}
      </td>

      <td className="bg-hsu/20 text-hsu font-semibold">{course.credit}</td>

      <td className="text-course-info-text-base-gray font-medium">
        {DeliveryMethodKorMap[course.delivery_method]}
      </td>

      <td className="text-course-info-text-base-gray font-medium">
        {course.requirement_types
          .map((rt) => RequirementTypeKorMap[rt])
          .join("/")}
      </td>

      <td className="bg-hsu/20 text-hsu font-semibold">
        {DayOrNightKorMap[course.day_or_night]}
      </td>

      <td className="text-course-info-text-base-gray font-medium whitespace-pre-line">
        <span className="text-hsu font-semibold">
          {course.online_hour > 0 && `온라인강좌: ${course.online_hour}시간\n`}
        </span>
        {course.delivery_method !== DeliveryMethodEnum.ONLINE &&
          (course.offline_schedules.length > 0
            ? formatOfflineScheduleView(course.offline_schedules)
            : "-")}
      </td>

      <td>
        {course.plan_code ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLecturePlan(course.plan_code!);
            }}
            className="bg-hsu rounded-3xl px-4 py-2 text-white"
          >
            조회
          </button>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}
