// 모바일 전용 카드

"use client";

import { DayOrNightKorMap } from "@/enums/day_or_night.enum";
import { DeliveryMethodEnum } from "@/enums/delivery_method.enum";
import { RequirementTypeKorMap } from "@/enums/requirement_type.enum";
import { CourseType } from "@/types/schemas/course.schema";
import { formatOfflineScheduleView } from "@/utils/format_offline_schedule_view";
import openLecturePlan from "@/utils/openLecturePlan";
import clsx from "clsx";

type Props = {
  course: CourseType;
  hoveredCourse: CourseType | null;
  handleClickCourseCard: (course: CourseType) => void;
  onAddCourse: (course: CourseType) => void;
};

export default function CourseInfoCard({
  course,
  hoveredCourse,
  handleClickCourseCard,
  onAddCourse,
}: Props) {
  return (
    <li
      className={clsx(
        "flex flex-col gap-5",
        "rounded-lg px-10 py-8",
        "cursor-pointer",
        hoveredCourse && hoveredCourse.id === course.id
          ? "bg-hsu/20"
          : "bg-linear-[135deg,var(--color-light-hsu)_0%,#fff_100%]",
      )}
      onClick={() => handleClickCourseCard(course)}
    >
      <div className="space-y-2">
        <h3 className={clsx("text-hsu-black-500 text-sm font-bold")}>
          {course.name}({course.section}) (
          {DayOrNightKorMap[course.day_or_night]})
        </h3>
        <span className={clsx("text-hsu-black-300 text-sm font-medium")}>
          {course.professors}
        </span>
      </div>
      <div className={clsx("text-hsu-black-300", "space-y-1")}>
        <p className="text-xs whitespace-pre">
          <span className="text-hsu font-semibold">
            {course.online_hour > 0 &&
              `온라인강좌: ${course.online_hour}시간\n`}
          </span>
          {course.delivery_method !== DeliveryMethodEnum.ONLINE &&
            (course.offline_schedules.length > 0
              ? formatOfflineScheduleView(course.offline_schedules)
              : "-")}
        </p>
        <p className="space-x-4 text-xs">
          <span>
            {course.grades
              .map((grade) => (grade === 0 ? "전학년" : `${grade}학년`))
              .join("/")}
          </span>
          <span>
            {course.requirement_types
              .map((rt) => RequirementTypeKorMap[rt])
              .join("/")}
          </span>
          <span>{course.credit}학점</span>
          <span>{`${course.code}-${course.section}`}</span>
        </p>
        {course.grade_limits.length > 0 && (
          <span className="text-red-600">
            학년제한: {course.grade_limits.join("/")}학년
          </span>
        )}
      </div>

      {hoveredCourse && hoveredCourse.course_id === course.course_id && (
        <div className="space-x-3">
          <button
            className={clsx(
              "w-fit px-4 py-2",
              "bg-hsu text-[1.1rem] text-white",
              "rounded-3xl",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onAddCourse(course);
            }}
          >
            시간표에 추가
          </button>
          {course.plan_code && (
            <button
              className={clsx(
                "w-fit px-4 py-2",
                "bg-hsu text-[1.1rem] text-white",
                "rounded-3xl",
              )}
              onClick={(e) => {
                e.stopPropagation();
                openLecturePlan(course.plan_code!);
              }}
            >
              계획서 조회
            </button>
          )}
        </div>
      )}
    </li>
  );
}
