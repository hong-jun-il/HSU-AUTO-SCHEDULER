import { GroupedScheduleByDayType } from "@/types/grouped_schedule_by_day.type";
import { OfflineScheduleType } from "@/types/schemas/offline_schedule.schema";

export default function groupOfflineScheduleByDay(
  offlineSchedules: OfflineScheduleType[],
): GroupedScheduleByDayType {
  return offlineSchedules.reduce((acc, cur) => {
    const newOfflineSchedulesInCurDay = acc[cur.day] ?? [];

    newOfflineSchedulesInCurDay.push(cur);

    acc[cur.day] = newOfflineSchedulesInCurDay;

    return acc;
  }, {} as GroupedScheduleByDayType);
}
