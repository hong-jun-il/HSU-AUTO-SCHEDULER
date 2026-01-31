"use client";

import CloseIcon from "@/assets/icons/CloseIcon";
import { useResponsiveContext } from "@/components/ResponsiveProvider";
import { COURSE_BLOCK_BG_COLORS } from "@/constants/block-colors.const";
import useHoverState from "@/hooks/common/useHoverState";
import useUnmarkCourseSchedule from "@/hooks/CourseFinder/PersonalSchedule/useUnmarkCourseSchedule";
import { CourseTimetableRenderType } from "@/types/course_timetable_render.type";
import clsx from "clsx";
import { useEffect, useRef } from "react";

type Props = {
  courseRenderInfo: CourseTimetableRenderType;
  isCPSATResult: boolean;
  isHoveredCourse: boolean;
};

export default function CourseBlock({
  courseRenderInfo,
  isCPSATResult,
  isHoveredCourse,
}: Props) {
  const deviceType = useResponsiveContext();
  const courseBlockRef = useRef<HTMLDivElement | null>(null);
  const isHoverEnabled = !isCPSATResult && !isHoveredCourse;
  const { isHovered, onMouseEnter, onMouseLeave } = useHoverState();
  const { deleteCourseAndUnmark } = useUnmarkCourseSchedule();

  // 모바일 환경에서 강의 클릭(호버)시 해당 강의의 위치로 스크롤
  useEffect(() => {
    if (courseBlockRef.current && isHoveredCourse && deviceType === "mobile") {
      courseBlockRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [courseBlockRef, isHoveredCourse, deviceType, courseRenderInfo]);

  return (
    <div
      ref={courseBlockRef}
      className={clsx(
        "border-y-timetable-cell-border absolute top-0 z-(--z-index-schedule-block) w-full overflow-hidden border-y max-md:p-2",
        COURSE_BLOCK_BG_COLORS[courseRenderInfo.colorIndex],
        isCPSATResult ? "p-2" : "p-4",
      )}
      style={{
        top: `${courseRenderInfo.top}px`,
        height: `${courseRenderInfo.height}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isHovered && isHoverEnabled && (
        <button
          className="float-right mt-2 mr-3 aspect-square w-7 bg-transparent max-md:w-5"
          onClick={() =>
            deleteCourseAndUnmark(
              courseRenderInfo.id,
              courseRenderInfo.name,
              courseRenderInfo.section,
            )
          }
        >
          <CloseIcon />
        </button>
      )}
      <h2
        className={clsx(
          "max-md:text-xxs font-extrabold max-lg:text-xs",
          isCPSATResult ? "text-xxs" : "text-sm",
        )}
      >
        {courseRenderInfo.name}({courseRenderInfo.section})
      </h2>

      <p
        className={clsx(
          "max-md:text-xxs max-md:flex-col",
          isCPSATResult ? "text-xxs" : "text-xs",
        )}
      >
        <em className="mr-1 font-semibold not-italic">
          {courseRenderInfo.professors}
        </em>
        <span>{courseRenderInfo.offlineSchedule?.place}</span>
      </p>
    </div>
  );
}
