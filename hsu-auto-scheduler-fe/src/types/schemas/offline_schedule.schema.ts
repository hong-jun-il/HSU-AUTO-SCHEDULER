import { WeekdayEnum } from "@/enums/weekday.enum";
import z from "zod";

export const offlineScheduleSchema = z.object({
  id: z.string().min(1, { error: "offline_schedule의 id는 필수 필드입니다" }),
  day: z.enum(WeekdayEnum, { error: "유효하지 않은 값입니다" }),
  start_time: z.number({
    error: "start_time은 숫자여야 합니다",
  }),
  end_time: z.number({ error: "end_time은 숫자여야 합니다" }),
  place: z.string({ error: "스케줄의 장소는 문자열이어야 합니다" }),
});

export const personalScheduleOfflineSchema = offlineScheduleSchema.extend({
  id: z.uuidv7({ error: "개인 스케줄의 id 필드는 uuid v7 형식이어야 합니다" }),
});

export type OfflineScheduleType = z.infer<typeof offlineScheduleSchema>;
