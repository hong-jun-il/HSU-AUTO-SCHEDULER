import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import useCurrentSemester from "../../common/useCurrentSemester";
import calcMinIndex from "@/utils/getTimeIndex";
import isOverlapTimeSelections from "@/utils/isOverlapTimeSelections";
import { CourseType } from "@/types/schemas/course.schema";

export default function useMarkCourseSchedule() {
  const {
    ensureSelectedCoursesSemesterInitialized,
    isCourseAdded,
    addCourse,
    ensureTimeSelectionInitialized,
    timeSelections,
    addTimeRange,
    clearHoveredCourse,
  } = useTimetableStore(
    useShallow((state) => ({
      ensureSelectedCoursesSemesterInitialized:
        state.ensureSelectedCoursesSemesterInitialized,
      selectedCourses: state.selectedCourses,
      isCourseAdded: state.isCourseAdded,
      addCourse: state.addCourse,
      ensureTimeSelectionInitialized: state.ensureTimeSelectionInitialized,
      timeSelections: state.timeSelections,
      addTimeRange: state.addTimeRange,
      clearHoveredCourse: state.clearHoveredCourse,
    })),
  );

  const currentSemester = useCurrentSemester();

  // 클릭 없이 추가랑 마크만 하는 함수
  // 밑의 클릭 있는 함수를 불러도 이 함수만 부르면 알아서 겹치는지 확인하고 삭제해줌
  const addCourseAndMark = (course: CourseType) => {
    ensureSelectedCoursesSemesterInitialized(currentSemester);
    ensureTimeSelectionInitialized(currentSemester);

    const timeSelectionsInCurSemester = timeSelections[currentSemester];

    for (const offlineSchedule of course.offline_schedules) {
      const curDay = offlineSchedule.day;
      const startIndex = calcMinIndex(offlineSchedule.start_time);
      const endIndex = calcMinIndex(offlineSchedule.end_time);

      if (
        isOverlapTimeSelections({
          timeSelections: timeSelectionsInCurSemester,
          day: curDay,
          startIndex,
          endIndex,
        })
      ) {
        alert("이미 같은 시간대에 추가된 스케줄이 있습니다");
        return;
      }
    }

    addCourse(currentSemester, course);
    for (const offlineSchedule of course.offline_schedules) {
      const curDay = offlineSchedule.day;
      const startIndex = calcMinIndex(offlineSchedule.start_time);
      const endIndex = calcMinIndex(offlineSchedule.end_time);
      addTimeRange(currentSemester, curDay, startIndex, endIndex);
    }
  };

  // course 선택 함수
  const onClickCourse = (course: CourseType) => {
    if (isCourseAdded(currentSemester, course.id)) {
      alert(`${course.name}-${course.section}반은 이미 추가한 수업입니다`);
      return;
    }

    addCourseAndMark(course);
    clearHoveredCourse();
  };

  return { addCourseAndMark, onClickCourse };
}
