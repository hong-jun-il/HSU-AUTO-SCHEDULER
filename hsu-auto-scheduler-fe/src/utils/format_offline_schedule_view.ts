import { WeekdayKorMap, WeekdayOrder } from "@/enums/weekday.enum";
import { formatTimeString } from "./formatTimeString";
import { OfflineScheduleType } from "@/types/schemas/offline_schedule.schema";

export function formatOfflineScheduleView(
  offlineSchedules: OfflineScheduleType[],
) {
  const offlineScheduleFotmat = [...offlineSchedules]
    .sort((a, b) => WeekdayOrder[a.day] - WeekdayOrder[b.day])
    .map(
      (offlineSchedule) =>
        `${WeekdayKorMap[offlineSchedule.day]}요일: ${offlineSchedule.place} ${formatTimeString(offlineSchedule.start_time)}~${formatTimeString(offlineSchedule.end_time)}`,
    );

  return offlineScheduleFotmat.join("\n");
}
