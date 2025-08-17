import { TimePlaceDBType, TimePlaceFileType } from "../type/timeplace.type";
import { WeekdayEnum } from "../type/weekday.enum";
import { v7 as uuidv7 } from "uuid";

export default function parseOfflineSchedules(
  timeplace: TimePlaceFileType[]
): TimePlaceDBType[] {
  return timeplace.map((tp) => {
    const offline_schedule_id = uuidv7();

    const day = Object.values(WeekdayEnum)[tp.day];
    const start_time = (tp.start / 12) * 60;
    const end_time = (tp.end / 12) * 60;

    return {
      offline_schedule_id,
      day,
      start_time,
      end_time,
      place: tp.place,
    };
  });
}
