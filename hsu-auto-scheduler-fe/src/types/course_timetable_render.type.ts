import { WeekdayEnum } from "@/enums/weekday.enum";
import { OfflineScheduleType } from "./schemas/offline_schedule.schema";

export type HoverCourseByDayType = Partial<
  Record<WeekdayEnum | "nontimes", CourseTimetableRenderType>
>;

export type SelectedCoursesByDayType = Partial<
  Record<WeekdayEnum | "nontimes", CourseTimetableRenderType[]>
>;

export type CourseTimetableRenderType = {
  id: string;
  name: string;
  section: string;
  professors: string;
  colorIndex: number;
  offlineSchedule?: OfflineScheduleType;
  top?: number;
  height?: number;
};
