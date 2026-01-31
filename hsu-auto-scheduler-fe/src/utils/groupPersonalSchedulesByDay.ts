// 시간표 렌더링에 필요한 개인 스케줄 정보를 요알을 기준으로 묶어주는 함수

import { PersonalSchedulesByDayType } from "@/types/personalScheduleRender.type";
import { getTopByStartTime } from "./getTopByStartTime";
import { getBlockHeight } from "./getBlockHeight";
import { PersonalScheduleType } from "@/types/schemas/personal_schedule.schema";

export default function groupPersonalScheduleByDay(
  personalSchedules: PersonalScheduleType[],
  isCPSATResult: boolean,
): PersonalSchedulesByDayType {
  return personalSchedules.reduce((acc, cur, index) => {
    cur.offline_schedules.forEach((offlineSchedule) => {
      const newPersonalSchedulesInCurDay = acc[offlineSchedule.day] ?? [];

      newPersonalSchedulesInCurDay.push({
        personalScheduleId: cur.id,
        personalScheduleName: cur.personal_schedule_name,
        offlineSchedule,
        colorIndex: index,
        top: getTopByStartTime(offlineSchedule.start_time, isCPSATResult),
        height: getBlockHeight(
          offlineSchedule.start_time,
          offlineSchedule.end_time,
          isCPSATResult,
        ),
      });

      acc[offlineSchedule.day] = newPersonalSchedulesInCurDay;
    });

    return acc;
  }, {} as PersonalSchedulesByDayType);
}
