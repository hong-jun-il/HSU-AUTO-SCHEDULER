import z from "zod";
import {
  OfflineScheduleType,
  personalScheduleOfflineSchema,
} from "./offline_schedule.schema";
import { v7 as uuidv7 } from "uuid";
import { WeekdayEnum } from "@/enums/weekday.enum";

export const personalScheduleSchema = z.object({
  id: z.uuidv7({ message: "유효한 uuid v7 형식이 아닙니다" }),
  personal_schedule_name: z
    .string()
    .trim()
    .min(1, { error: "개인 스케줄의 이름을 입력해주세요" }),
  offline_schedules: z.array(personalScheduleOfflineSchema),
});

export type PersonalScheduleType = z.infer<typeof personalScheduleSchema>;

export function createOfflineScheduleDefaultValue(): OfflineScheduleType {
  return {
    id: uuidv7(),
    day: WeekdayEnum.MON,
    start_time: 540,
    end_time: 600,
    place: "",
  };
}

export function createPersonalScheduleDefaultValue(): PersonalScheduleType {
  return {
    id: uuidv7(),
    personal_schedule_name: "",
    offline_schedules: [createOfflineScheduleDefaultValue()],
  };
}
