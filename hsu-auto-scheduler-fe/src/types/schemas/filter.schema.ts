import { DayOrNightEnum } from "@/enums/day_or_night.enum";
import { WeekdayEnum } from "@/enums/weekday.enum";
import z from "zod";
import { personalScheduleSchema } from "./personal_schedule.schema";
import { DEFAULT_SEMESTER } from "@/constants/semester.const";
import { courseSchema } from "./course.schema";

export const baseFilterSchema = z.object({
  semester_id: z.string().min(1, { error: "semester_id는 필수 필드입니다!" }),
  major_id: z.string().nullable(),
  grade: z
    .string()
    .min(1, { error: "학년을 입력해주세요!" })
    .max(4)
    .refine((e) => !isNaN(Number(e)), { error: "학년은 숫자만 입력" })
    .nullable(),
  day_or_night: z
    .string()
    .min(1, { error: "주/야를 선택해주세요!" })
    .refine(
      (val) => Object.values(DayOrNightEnum).includes(val as DayOrNightEnum),
      { message: "올바른 주/야 값이 아닙니다." },
    )
    .nullable(),
  no_class_days: z.array(
    z.enum(WeekdayEnum, { error: "유효하지 않은 값입니다" }),
  ),
  personal_schedules: z.array(personalScheduleSchema, {
    error: "유효하지 않은 값입니다",
  }),
  selected_courses: z.array(courseSchema, {
    error: "유효하지 않은 값입니다",
  }),
  has_lunch_break: z.boolean(),
});

export const courseFilterSchema = baseFilterSchema.extend({
  search: z.string().nullable(),
});

export const CPSATFilterSchema = baseFilterSchema.extend({
  major_id: z.string().min(1, { error: "전공을 선택해주세요!" }),
  grade: z
    .string()
    .min(1, { error: "학년을 입력해주세요!" })
    .max(4)
    .refine((e) => !isNaN(Number(e)), { error: "학년은 숫자만 입력" }),
  day_or_night: z
    .string()
    .min(1, { error: "주/야를 선택해주세요!" })
    .refine(
      (val) => Object.values(DayOrNightEnum).includes(val as DayOrNightEnum),
      { message: "올바른 주/야 값이 아닙니다." },
    ),
  max_credit: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        return Number(val);
      }
      return val;
    },
    z
      .number()
      .min(0, { error: "0미만의 값은 입력할 수 없습니다" })
      .max(21, { error: "최대 학점은 21학점 미만입니다" }),
  ),
  major_basic: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        return Number(val);
      }
      return val;
    },
    z
      .number()
      .min(0, { error: "0미만의 값은 입력할 수 없습니다" })
      .max(21, { error: "전공 기초는 21학점 미만입니다" }),
  ),
  major_required: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        return Number(val);
      }
      return val;
    },
    z
      .number()
      .min(0, { error: "0미만의 값은 입력할 수 없습니다" })
      .max(21, { error: "전공 필수는 21학점 미만입니다" }),
  ),
  major_elective: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        return Number(val);
      }
      return val;
    },
    z
      .number()
      .min(0, { error: "0미만의 값은 입력할 수 없습니다" })
      .max(21, { error: "전공 선택은 21학점 미만입니다" }),
  ),
  daily_lecture_limit: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        return +val;
      }

      return val;
    },
    z.number().min(1, {
      error: "하루 최대 강의 제한은 1미만의 값을 입력할 수 없습니다",
    }),
  ),
});

export type CourseFilterType = z.infer<typeof courseFilterSchema>;
export type CPSATFilterType = z.infer<typeof CPSATFilterSchema>;

export const courseFilterDefaultValues: CourseFilterType = {
  semester_id: DEFAULT_SEMESTER,
  major_id: "",
  search: "",
  grade: "",
  day_or_night: "",
  no_class_days: [WeekdayEnum.SAT, WeekdayEnum.SUN],
  personal_schedules: [],
  selected_courses: [],
  has_lunch_break: false,
};

export const CPSATFilterDefaultValues: CPSATFilterType = {
  semester_id: DEFAULT_SEMESTER,
  major_id: "",
  grade: "",
  day_or_night: "",
  no_class_days: [WeekdayEnum.SAT, WeekdayEnum.SUN],
  personal_schedules: [],
  selected_courses: [],
  max_credit: 18,
  major_basic: 0,
  major_required: 0,
  major_elective: 0,
  daily_lecture_limit: 3,
  has_lunch_break: false,
};
