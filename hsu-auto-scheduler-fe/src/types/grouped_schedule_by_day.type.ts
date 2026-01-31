import { WeekdayEnum } from "@/enums/weekday.enum";
import { OfflineScheduleType } from "./schemas/offline_schedule.schema";

export type GroupedScheduleByDayType = Record<
  WeekdayEnum,
  OfflineScheduleType[]
>;
