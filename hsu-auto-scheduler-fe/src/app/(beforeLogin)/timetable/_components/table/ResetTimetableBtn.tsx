"use client";

import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";

export default function ResetTimetableBtn() {
  const currentSemester = useCurrentSemester();
  const { resetSelectedCourses, resetPersonalSchedules, resetTimeSelection } =
    useTimetableStore(
      useShallow((state) => ({
        resetSelectedCourses: state.resetSelectedCourses,
        resetPersonalSchedules: state.resetPersonalSchedules,
        resetTimeSelection: state.resetTimeSelection,
      })),
    );

  const handleResetTimetableStore = (semester: string) => {
    const shouldReset = confirm(`${semester}의 시간표를 초기화하시겠습니까?`);

    if (shouldReset) {
      resetSelectedCourses(semester);
      resetPersonalSchedules(semester);
      resetTimeSelection(semester);
    }
  };
  return (
    <button
      className="mr-3 h-14 rounded-lg bg-white px-3 py-3 text-xs whitespace-nowrap"
      onClick={() => handleResetTimetableStore(currentSemester)}
    >
      시간표 초기화
    </button>
  );
}
