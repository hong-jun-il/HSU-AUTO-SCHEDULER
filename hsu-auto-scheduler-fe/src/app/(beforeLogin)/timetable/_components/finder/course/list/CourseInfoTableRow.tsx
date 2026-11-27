// 데스크탑 전용 강의 목록 행

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
import { COURSE_TABLE_GRID_COLUMNS } from "./courseTableGrid";

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
    <div
      role="row"
      className={clsx(
        "grid min-h-22 cursor-pointer bg-white text-center text-xs",
        // 셀은 행 높이만큼 늘어나고(배경색 칸이 행을 꽉 채우도록) 내용은 가운데 정렬
        "[&>div]:flex [&>div]:items-center [&>div]:justify-center",
        "hover:bg-course-finder-courses-table-row-hover-bg",
        // 강의를 한 번에 전부 그리므로, 화면 밖 행은 브라우저가 레이아웃·그리기를 건너뛰게 한다.
        // <tr> 에는 content-visibility 가 적용되지 않아 div 그리드로 바꿨다. 44px 은 그리기 전 자리값(한 줄 행 높이)
        "[content-visibility:auto] [contain-intrinsic-size:auto_44px]",
      )}
      style={{ gridTemplateColumns: COURSE_TABLE_GRID_COLUMNS }}
      onMouseEnter={() => setHoveredCourse(course)}
      onMouseLeave={clearHoveredCourse}
      onClick={() => onClickCourse(course)}
    >
      <div role="cell">
        <span className="text-hsu bg-hsu/20 rounded-lg p-3 font-semibold">{`${course.code}-${course.section}`}</span>
      </div>

      <div role="cell" className="text-hsu font-semibold">
        {course.name}
      </div>

      <div role="cell" className="text-hsu-black-300 font-medium">
        {course.professors}
      </div>

      <div role="cell" className="bg-hsu/20 text-hsu font-semibold">
        {course.grades
          .map((grade) => (grade === 0 ? "전학년" : grade))
          .join("/")}
      </div>

      <div role="cell" className="text-course-info-text-base-gray font-medium">
        {course.grade_limits.length > 0 ? course.grade_limits.join(", ") : "-"}
      </div>

      <div role="cell" className="bg-hsu/20 text-hsu font-semibold">
        {course.credit}
      </div>

      <div role="cell" className="text-course-info-text-base-gray font-medium">
        {DeliveryMethodKorMap[course.delivery_method]}
      </div>

      <div role="cell" className="text-course-info-text-base-gray font-medium">
        {course.requirement_types
          .map((rt) => RequirementTypeKorMap[rt])
          .join("/")}
      </div>

      <div role="cell" className="bg-hsu/20 text-hsu font-semibold">
        {DayOrNightKorMap[course.day_or_night]}
      </div>

      <div
        role="cell"
        className="text-course-info-text-base-gray !block self-center font-medium whitespace-pre-line"
      >
        <span className="text-hsu font-semibold">
          {course.online_hour > 0 && `온라인강좌: ${course.online_hour}시간\n`}
        </span>
        {course.delivery_method !== DeliveryMethodEnum.ONLINE &&
          (course.offline_schedules.length > 0
            ? formatOfflineScheduleView(course.offline_schedules)
            : "-")}
      </div>

      <div role="cell">
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
      </div>
    </div>
  );
}
