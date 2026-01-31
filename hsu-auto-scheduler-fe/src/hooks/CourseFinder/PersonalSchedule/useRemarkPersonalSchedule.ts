import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import useCurrentSemester from "../../common/useCurrentSemester";
import { PersonalScheduleType } from "@/types/schemas/personal_schedule.schema";
import groupOfflineScheduleByDay from "@/utils/groupOfflineScheduleByDay";
import { MarkResultType } from "@/types/markResult.type";
import isOverlapPersonalScheduleTimes from "@/utils/isOverlapPersonalScheduleTimes";
import getTimeIndex from "@/utils/getTimeIndex";
import { WeekdayEnum, WeekdayKorMap } from "@/enums/weekday.enum";
import isOverlapTimeSelections from "@/utils/isOverlapTimeSelections";

export default function useRemarkPersonalSchedule() {
  const currentSemester = useCurrentSemester();

  const {
    ensurePersonalSchedulesSemesterInitialized,
    ensureTimeSelectionInitialized,
    personalSchedules,
    timeSelections,
    updatePersonalSchedule,
    addTimeRange,
    deleteTimeRange,
  } = useTimetableStore(
    useShallow((state) => ({
      ensurePersonalSchedulesSemesterInitialized:
        state.ensurePersonalSchedulesSemesterInitialized,
      ensureTimeSelectionInitialized: state.ensureTimeSelectionInitialized,
      personalSchedules: state.personalSchedules,
      timeSelections: state.timeSelections,
      updatePersonalSchedule: state.updatePersonalSchedule,
      addTimeRange: state.addTimeRange,
      deleteTimeRange: state.deleteTimeRange,
    })),
  );

  /* 
          1. 등록하려는 개인 스케줄 내에서 서로 겹치는지 검사
          2. 먼저 업데이트 되기 전의 personalSchedule과 timeSelections를 먼저 찾음
          3. 찾은 timeSelections에서 업데이트 되기 전의 personalSchedule의 시간대를 지움
          4. 지우고 난 timeSelections에서 새로 업데이트 된 개인 스케줄의 시간대를 
      */
  const updatePersonalScheduleAndRemark = (
    updatedPersonalSchedule: PersonalScheduleType,
  ): MarkResultType => {
    ensurePersonalSchedulesSemesterInitialized(currentSemester);
    ensureTimeSelectionInitialized(currentSemester);

    const personalSchedulesInCurSemester = personalSchedules[currentSemester];
    const timeSelectionsInCurSemester = timeSelections[currentSemester];
    const timeSelectionsInCurSemesterClone = structuredClone(
      timeSelectionsInCurSemester,
    );

    const prevPersonalSchedule = personalSchedulesInCurSemester.find(
      (ps) => ps.id === updatedPersonalSchedule.id,
    );

    const prevPersonalScheduleOfflineSchedules =
      prevPersonalSchedule?.offline_schedules;

    if (prevPersonalScheduleOfflineSchedules) {
      const prevGroupedOfflineSchedulesByDay = groupOfflineScheduleByDay(
        prevPersonalScheduleOfflineSchedules,
      );
      const updatedOfflineSchedulesGroupedByDay = groupOfflineScheduleByDay(
        updatedPersonalSchedule.offline_schedules,
      );

      // 현재 개인 스케줄의 시간대끼리의 검사
      if (isOverlapPersonalScheduleTimes(updatedOfflineSchedulesGroupedByDay)) {
        return {
          success: false,
          message: "현재 등록하려는 개인 스케줄 간 시간이 겹칩니다.",
        };
      }

      // 업데이트 이전 개인 스케줄 시간대를 지움
      for (const day in prevGroupedOfflineSchedulesByDay) {
        const offlineSchedulesInCurDay =
          prevGroupedOfflineSchedulesByDay[day as WeekdayEnum];
        const timeSelectionsInCurDay =
          timeSelectionsInCurSemesterClone[day as WeekdayEnum];

        for (const offlineSchedule of offlineSchedulesInCurDay) {
          const startIndex = getTimeIndex(offlineSchedule.start_time);
          const endIndex = getTimeIndex(offlineSchedule.end_time);

          for (let i = startIndex; i < endIndex; i++) {
            timeSelectionsInCurDay[i] = 0;
          }
        }
      }

      // 기존 시간표에 등록하려는 개인 스케줄의 시간대와 겹치는 시간이 있는지 검사
      // 오프라인 스케줄이 여러개가 있을 수 있으므로 해당 오프라인 스케줄을 다 돌면서 timeSelections의 isOverlap으로 검사
      for (const day in updatedOfflineSchedulesGroupedByDay) {
        const offlineSchedulesInCurDay =
          updatedOfflineSchedulesGroupedByDay[day as WeekdayEnum];

        for (const offlineSchedule of offlineSchedulesInCurDay) {
          const startIndex = getTimeIndex(offlineSchedule.start_time);
          const endIndex = getTimeIndex(offlineSchedule.end_time);
          if (
            isOverlapTimeSelections({
              timeSelections: timeSelectionsInCurSemesterClone,
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

      //   개인 스케줄 수정
      updatePersonalSchedule(currentSemester, updatedPersonalSchedule);

      // 기존 시간을 원본 타임 셀렉션에서 제거
      for (const day in prevGroupedOfflineSchedulesByDay) {
        const offlineSchedulesInCurDay =
          prevGroupedOfflineSchedulesByDay[day as WeekdayEnum];

        for (const offlineSchedule of offlineSchedulesInCurDay) {
          const startIndex = getTimeIndex(offlineSchedule.start_time);
          const endIndex = getTimeIndex(offlineSchedule.end_time);

          deleteTimeRange(
            currentSemester,
            day as WeekdayEnum,
            startIndex,
            endIndex,
          );
        }
      }

      // timeSelections에 추가
      for (const day in updatedOfflineSchedulesGroupedByDay) {
        const offlineSchedulesInCurDay =
          updatedOfflineSchedulesGroupedByDay[day as WeekdayEnum];

        for (const offlineSchedule of offlineSchedulesInCurDay) {
          const startIndex = getTimeIndex(offlineSchedule.start_time);
          const endIndex = getTimeIndex(offlineSchedule.end_time);

          addTimeRange(
            currentSemester,
            day as WeekdayEnum,
            startIndex,
            endIndex,
          );
        }
      }
    }

    return { success: true };
  };

  return { updatePersonalScheduleAndRemark };
}
