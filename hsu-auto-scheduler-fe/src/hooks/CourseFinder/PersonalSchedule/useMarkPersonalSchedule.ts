import { useTimetableStore } from "@/store/timetable/timetableStore";
import { PersonalScheduleType } from "@/types/schemas/personal_schedule.schema";
import { useShallow } from "zustand/shallow";
import { WeekdayEnum, WeekdayKorMap } from "@/enums/weekday.enum";
import isOverlapPersonalScheduleTimes from "@/utils/isOverlapPersonalScheduleTimes";
import getTimeIndex from "@/utils/getTimeIndex";
import { MarkResultType } from "@/types/markResult.type";
import groupOfflineScheduleByDay from "@/utils/groupOfflineScheduleByDay";
import checkOverlapTimeSelections from "@/utils/isOverlapTimeSelections";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";

export default function useMarkPersonalSchedule() {
  const currentSemester = useCurrentSemester();

  const {
    ensurePersonalSchedulesSemesterInitialized,
    timeSelections,
    addPersonalSchedule,
    ensureTimeSelectionInitialized,
    addTimeRange,
  } = useTimetableStore(
    useShallow((state) => ({
      ensurePersonalSchedulesSemesterInitialized:
        state.ensurePersonalSchedulesSemesterInitialized,
      timeSelections: state.timeSelections,
      addPersonalSchedule: state.addPersonalSchedule,
      ensureTimeSelectionInitialized: state.ensureTimeSelectionInitialized,
      addTimeRange: state.addTimeRange,
    })),
  );

  const addPersonalScheduleAndMark = (
    personalSchedule: PersonalScheduleType,
  ): MarkResultType => {
    ensurePersonalSchedulesSemesterInitialized(currentSemester);
    ensureTimeSelectionInitialized(currentSemester);

    const offlineSchedules = personalSchedule.offline_schedules;

    const groupedOfflineSchedulesByDay =
      groupOfflineScheduleByDay(offlineSchedules);

    // 현재 개인 스케줄의 시간대끼리의 검사
    if (isOverlapPersonalScheduleTimes(groupedOfflineSchedulesByDay)) {
      return {
        success: false,
        message: "현재 등록하려는 개인 스케줄 간 시간이 겹칩니다.",
      };
    }

    // 기존 시간표에 등록하려는 개인 스케줄의 시간대와 겹치는 시간이 있는지 검사
    // 오프라인 스케줄이 여러개가 있을 수 있으므로 해당 오프라인 스케줄을 다 돌면서 timeSelections의 isOverlap으로 검사
    for (const day in groupedOfflineSchedulesByDay) {
      const offlineSchedulesInCurDay =
        groupedOfflineSchedulesByDay[day as WeekdayEnum];

      for (const offlineSchedule of offlineSchedulesInCurDay) {
        const startIndex = getTimeIndex(offlineSchedule.start_time);
        const endIndex = getTimeIndex(offlineSchedule.end_time);
        if (
          checkOverlapTimeSelections({
            timeSelections: timeSelections[currentSemester],
            day: day as WeekdayEnum,
            startIndex,
            endIndex,
          })
        ) {
          return {
            success: false,
            message: `${WeekdayKorMap[day as WeekdayEnum]}요일의 같은 시간대에 이미 등록된 스케줄이 있습니다!`,
          };
        }
      }
    }

    // 개인 스케줄에 추가
    addPersonalSchedule(currentSemester, personalSchedule);

    // timeSelections에 추가
    for (const day in groupedOfflineSchedulesByDay) {
      const offlineSchedulesInCurDay =
        groupedOfflineSchedulesByDay[day as WeekdayEnum];

      for (const offlineSchedule of offlineSchedulesInCurDay) {
        const startIndex = getTimeIndex(offlineSchedule.start_time);
        const endIndex = getTimeIndex(offlineSchedule.end_time);

        addTimeRange(currentSemester, day as WeekdayEnum, startIndex, endIndex);
      }
    }

    return { success: true };
  };

  return { addPersonalScheduleAndMark };
}
