"use client";

import CloseIcon from "@/assets/icons/CloseIcon";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { CourseRenderInfoType } from "@/types/courseRender.type";
import clsx from "clsx";
import { useShallow } from "zustand/shallow";

type Props = {
  onlineCourses: CourseRenderInfoType[];
  isCPSATResult: boolean;
};

export default function OnlineCourseList({
  onlineCourses,
  isCPSATResult,
}: Props) {
  const currentSemester = useCurrentSemester();
  const { deleteCourse } = useTimetableStore(
    useShallow((state) => ({
      deleteCourse: state.deleteCourse,
    })),
  );

  const handleDeleteOnlineCourse = (onlineCourse: CourseRenderInfoType) => {
    const shouldDelete = confirm(
      `${onlineCourse.courseName}-${onlineCourse.courseClassSection}반을 삭제하시겠습니까?`,
    );

    if (shouldDelete) {
      deleteCourse(currentSemester, onlineCourse.courseId);
    }
  };

  return (
    <div
      className={clsx(
        "border-border-hsu w-full border-y border-b-transparent",
        !isCPSATResult && "pb-20",
      )}
    >
      {onlineCourses.map((onlineCourse) => (
        <div
          key={onlineCourse.courseId}
          className="bg-timetable-body-bg border-border-hsu border-x border-b p-5"
        >
          <div className="flex w-fit items-center gap-3">
            <h2 className="max-md:text-xxs text-sm font-extrabold max-lg:text-xs">
              {onlineCourse.courseName}({onlineCourse.courseClassSection})
            </h2>
            <span className="max-lg:text-xxl pt-1 text-xs max-md:text-[.8rem]">
              {onlineCourse.professors.join(", ")}
            </span>
            {!isCPSATResult && (
              <button
                className="aspect-square w-7 bg-transparent pt-[3px] max-md:w-5"
                onClick={() => handleDeleteOnlineCourse(onlineCourse)}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
