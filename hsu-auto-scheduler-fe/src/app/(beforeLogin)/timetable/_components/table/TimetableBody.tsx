"use client";

import { useEffect, useMemo } from "react";
import clsx from "clsx";
import { useShallow } from "zustand/shallow";
import { motion } from "framer-motion";
import {
  CourseTimetableRenderType,
  HoverCourseByDayType,
  SelectedCoursesByDayType,
} from "@/types/course_timetable_render.type";
import { getTopByStartTime } from "@/utils/getTopByStartTime";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { getBlockHeight } from "@/utils/getBlockHeight";
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
    hoveredCourse,
    selectedCourses,
    ensureSelectedCoursesSemesterInitialized,
    personalSchedules,
    ensurePersonalSchedulesSemesterInitialized,
    personalScheduleModalIsOpen,
    courseFinderHeight,
  } = useTimetableStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      hoveredCourse: state.hoveredCourse,
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

  const hoveredCourseByDay: HoverCourseByDayType | undefined = useMemo(() => {
    if (!hoveredCourse) return undefined;

    const baseInfo: CourseTimetableRenderType = {
      id: hoveredCourse.course_id,
      name: hoveredCourse.name,
      section: hoveredCourse.section,
      professors: hoveredCourse.professors,
      colorIndex: 0,
    };

    // 오프라인 스케줄이 있을 경우
    if (hoveredCourse.offline_schedules.length > 0) {
      return hoveredCourse.offline_schedules.reduce((acc, cur) => {
        if (!acc[cur.day]) {
          acc[cur.day] = {
            ...baseInfo,
            offlineSchedule: cur,
            top: getTopByStartTime(cur.start_time, false),
            height: getBlockHeight(cur.start_time, cur.end_time, false),
          };
        }

        return acc;
      }, {} as HoverCourseByDayType);
    }
    // 온라인이거나 오프라인 스케줄이 없을 경우
    else {
      return { nontimes: baseInfo };
    }
  }, [hoveredCourse]);

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
        hoveredCourseByDay={hoveredCourseByDay}
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
