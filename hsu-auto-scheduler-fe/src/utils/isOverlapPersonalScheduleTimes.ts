import { WeekdayEnum } from "@/enums/weekday.enum";
import { GroupedScheduleByDayType } from "@/types/grouped_schedule_by_day.type";

export default function isOverlapPersonalScheduleTimes(
  groupedOfflineSchedulesByDay: GroupedScheduleByDayType,
): boolean {
  for (const day in groupedOfflineSchedulesByDay) {
    const schedulesInCurDay = [
      ...groupedOfflineSchedulesByDay[day as WeekdayEnum],
    ].sort((a, b) => a.start_time - b.start_time);
    for (let i = 0; i < schedulesInCurDay.length - 1; i++) {
      if (schedulesInCurDay[i].end_time > schedulesInCurDay[i + 1].start_time) {
        return true;
      }
    }
  }

  return false;
}
