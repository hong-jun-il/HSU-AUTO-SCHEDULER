"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import { CPSATSolutionType } from "@/types/CPSATSolution.type";
import groupCoursesByDay from "@/utils/groupCoursesByDay";
import { SelectedCoursesByDayType } from "@/types/course_timetable_render.type";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { PersonalSchedulesByDayType } from "@/types/personalScheduleRender.type";
import groupPersonalScheduleByDay from "@/utils/groupPersonalSchedulesByDay";
import CPSATTabNavigation from "./CPSATTabNavigation";
import CPSATTimetableTab from "./CPSATTimetableTab";
import CPSATSummaryTab from "./CPSATSummaryTab";

type Props = {
  tabMode: "timetableMode" | "summaryMode";
  setTabMode: Dispatch<SetStateAction<"timetableMode" | "summaryMode">>;
  CPSATResult: CPSATSolutionType[];
  currentIndex: number;
};

export default function CPSATTabRenderer({
  tabMode,
  setTabMode,
  CPSATResult,
  currentIndex,
}: Props) {
  const currentSemester = useCurrentSemester();
  const { personalSchedules } = useTimetableStore(
    useShallow((state) => ({
      personalSchedules: state.personalSchedules,
    })),
  );

  const personalSchedulesInCurSemester = personalSchedules[currentSemester];

  const selectedCoursesByDayList: SelectedCoursesByDayType[] = useMemo(() => {
    return CPSATResult.map((result) =>
      groupCoursesByDay(result.selected_courses, true),
    );
  }, [CPSATResult]);

  const personalSchedulesByDay: PersonalSchedulesByDayType | undefined =
    useMemo(() => {
      if (!personalSchedulesInCurSemester) {
        return undefined;
      }

      return groupPersonalScheduleByDay(personalSchedulesInCurSemester, true);
    }, [personalSchedulesInCurSemester]);

  const renderTabContent = () => {
    switch (tabMode) {
      case "timetableMode":
        return (
          <CPSATTimetableTab
            selectedCoursesByDayList={selectedCoursesByDayList}
            personalSchdulesByDay={personalSchedulesByDay}
            currentIndex={currentIndex}
          />
        );
      case "summaryMode":
        return (
          <CPSATSummaryTab
            CPSATResult={CPSATResult}
            currentIndex={currentIndex}
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <CPSATTabNavigation tabMode={tabMode} setTabMode={setTabMode} />
      <div className="mt-10 h-[calc(100%-124px)] overflow-y-auto px-8 pb-10">
        {renderTabContent()}
      </div>
    </div>
  );
}
