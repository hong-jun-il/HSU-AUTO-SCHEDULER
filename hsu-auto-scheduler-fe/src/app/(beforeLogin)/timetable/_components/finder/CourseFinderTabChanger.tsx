"use client";

import { useTimetableStore } from "@/store/timetable/timetableStore";
import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";
import { useShallow } from "zustand/shallow";

type Props = {
  editMode: "course" | "schedule";
  setEditMode: Dispatch<SetStateAction<"course" | "schedule">>;
};

export default function CourseFinderTabChanger({
  editMode,
  setEditMode,
}: Props) {
  const { clearHoveredCourse } = useTimetableStore(
    useShallow((state) => ({
      clearHoveredCourse: state.clearHoveredCourse,
    })),
  );

  const handleCourseMode = () => {
    setEditMode("course");
  };

  const handleScheduleMode = () => {
    setEditMode("schedule");
    clearHoveredCourse();
  };

  return (
    <nav className="absolute top-0 left-0 flex translate-y-[-98%] bg-transparent text-xs">
      <button
        className={clsx(
          "border-course-finder-border boder-b-0 rounded-t-lg border border-r-0 border-b-0 p-5 transition-colors duration-200",
          editMode === "course" ? "bg-white" : "bg-[#807f7e] text-zinc-800",
        )}
        onClick={handleCourseMode}
      >
        시간표 생성
      </button>
      <button
        className={clsx(
          "border-course-finder-border rounded-t-lg border border-b-0 p-5 transition-colors duration-200",
          editMode === "schedule" ? "bg-white" : "bg-[#807f7e] text-zinc-800",
        )}
        onClick={handleScheduleMode}
      >
        개인 스케줄 추가
      </button>
    </nav>
  );
}
