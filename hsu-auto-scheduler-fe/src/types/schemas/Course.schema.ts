import { DayOrNightEnum } from "@/enums/day_or_night.enum";
import z from "zod";
import { offlineScheduleSchema } from "./offline_schedule.schema";
import { RequirementTypeEnum } from "@/enums/requirement_type.enum";
import { DeliveryMethodEnum } from "@/enums/delivery_method.enum";

export const courseSchema = z.object({
  id: z.string().min(1, { error: "id는 필수 필드입니다" }),
  course_id: z.string().min(1, { error: "course id는 필수 필드입니다" }),
  code: z.string().min(1, { error: "code는 필수 필드입니다" }),
  name: z.string().min(1, { error: "name은 필수 필드입니다" }),
  credit: z
    .number({ error: "학점은 숫자여야 합니다" })
    .min(1, { error: "학점의 최솟값은 1이상이어야 합니다" }),
  professors: z.string().min(1, { error: "professors 필드는 필수 필드입니다" }),
  requirement_types: z.array(
    z.enum(RequirementTypeEnum, { error: "유효하지 않은 값입니다" }),
    {
      error: "이수 구분은 배열이어야 합니다",
    },
  ),
  delivery_method: z.enum(DeliveryMethodEnum, {
    error: "유효하지 않은 값입니다",
  }),
  day_or_night: z.enum(DayOrNightEnum, { error: "유효하지 않은 값입니다" }),
  section: z
    .string({ error: "분반은 문자열이어야 합니다" })
    .min(1, { error: "section은 필수 필드입니다" }),
  grades: z.array(z.number({ error: "grades는 숫자의 배열이어야 합니다" })),
  grade_limits: z.array(
    z.number({ error: "grade_limit은 숫자의 배열이어야 합니다" }),
  ),
  online_hour: z.coerce.number({ error: "online_hour 필드는 숫자여야 합니다" }),
  plan_code: z.nullable(z.string()),
  remark: z.nullable(z.string()),
  offline_schedules: z.array(offlineScheduleSchema),
});

export type CourseType = z.infer<typeof courseSchema>;
