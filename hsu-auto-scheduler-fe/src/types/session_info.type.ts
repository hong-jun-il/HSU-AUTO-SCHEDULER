import { OfflineScheduleType } from "./schemas/offline_schedule.schema";

export type SessionInfoType = {
  online: number;
  offline_schedules: OfflineScheduleType[] | null;
};
