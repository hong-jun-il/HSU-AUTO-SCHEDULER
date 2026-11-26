"use client";

import { useEffect, useMemo } from "react";
import clsx from "clsx";
import { useShallow } from "zustand/shallow";
import { motion } from "framer-motion";
import { SelectedCoursesByDayType } from "@/types/course_timetable_render.type";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { PersonalSchedulesByDayType } from "@/types/personalScheduleRender.type";
import groupCoursesByDay from "@/utils/groupCoursesByDay";
import groupPersonalScheduleByDay from "@/utils/groupPersonalSchedulesByDay";
import TimeTableGrid from "./TimeTableGrid";
import OnlineCourseList from "./OnlineCourseList";
import PersonalScheduleModal from "../finder/personal_schedule/PersonalScheduleModal";

export default function TimeTableBody() {
  const currentSemester = useCurrentSemester();
  const {
    isOpen,
    selectedCourses,
    ensureSelectedCoursesSemesterInitialized,
    personalSchedules,
    ensurePersonalSchedulesSemesterInitialized,
    personalScheduleModalIsOpen,
    courseFinderHeight,
  } = useTimetableStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      selectedCourses: state.selectedCourses,
      ensureSelectedCoursesSemesterInitialized:
        state.ensureSelectedCoursesSemesterInitialized,
      personalSchedules: state.personalSchedules,
      ensurePersonalSchedulesSemesterInitialized:
        state.ensurePersonalSchedulesSemesterInitialized,
      personalScheduleModalIsOpen: state.personalScheduleModalIsOpen,
      courseFinderHeight: state.courseFinderHeight,
    })),
  );

  const selectedCoursesInCurSemester = selectedCourses[currentSemester];
  const personalSchedulesInCurSemester = personalSchedules[currentSemester];

  useEffect(() => {
    if (!selectedCoursesInCurSemester) {
      ensureSelectedCoursesSemesterInitialized(currentSemester);
    }

    if (!personalSchedulesInCurSemester) {
      ensurePersonalSchedulesSemesterInitialized(currentSemester);
    }
  }, [
    currentSemester,
    selectedCoursesInCurSemester,
    ensureSelectedCoursesSemesterInitialized,
    personalSchedulesInCurSemester,
    ensurePersonalSchedulesSemesterInitialized,
  ]);

  const selectedCoursesByDay: SelectedCoursesByDayType | undefined =
    useMemo(() => {
      if (!selectedCoursesInCurSemester) {
        return undefined;
      }

      return groupCoursesByDay(selectedCoursesInCurSemester, false);
    }, [selectedCoursesInCurSemester]);

  const personalSchedulesByDay: PersonalSchedulesByDayType | undefined =
    useMemo(() => {
      if (!personalSchedulesInCurSemester) {
        return undefined;
      }

      return groupPersonalScheduleByDay(personalSchedulesInCurSemester, false);
    }, [personalSchedulesInCurSemester]);

  return (
    <motion.div
      initial={{
        height: isOpen ? `calc(${100 - courseFinderHeight}dvh - 52px)` : "auto",
      }}
      animate={{
        height: isOpen
          ? // 밑의 52px은 헤더(TimetableTitle)의 높이
            `calc(${100 - courseFinderHeight}dvh - 52px)`
          : "auto",
      }}
      transition={{
        duration: 1,
        ease: "easeInOut",
      }}
      className={clsx("relative flex h-fit w-full flex-col")}
    >
      <TimeTableGrid
        selectedCoursesByDay={selectedCoursesByDay}
        personalSchedulesByDay={personalSchedulesByDay}
        isCPSATResult={false}
      />
      {selectedCoursesByDay && selectedCoursesByDay["nontimes"] && (
        <OnlineCourseList
          onlineCourses={selectedCoursesByDay["nontimes"]}
          isCPSATResult={false}
        />
      )}

      {personalScheduleModalIsOpen && <PersonalScheduleModal />}
    </motion.div>
  );
}
