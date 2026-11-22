import { TimePlaceDBType, TimePlaceFileType } from "../type/timeplace.type";
import { WeekdayEnum } from "../type/enums/weekday.enum";

export default function parseOfflineSchedules(
  timeplace: TimePlaceFileType[],
): TimePlaceDBType[] {
  return timeplace.map((tp) => {
    const day = Object.values(WeekdayEnum)[tp.day];
    const start_time = (tp.start / 12) * 60;
    const end_time = (tp.end / 12) * 60;

    return {
      day,
      start_time,
      end_time,
      place: tp.place,
    };
  });
}
