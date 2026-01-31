import { WeekdayEnum } from "@/enums/weekday.enum";
import { CourseType } from "./schemas/course.schema";

export type CPSATSolutionType = {
  solution_index: string;
  total_credit: number;
  total_major_basic_credit: number;
  total_major_required_credit: number;
  total_major_elective_credit: number;
  total_course_gap: number;
  total_offline_course_count: number;
  total_online_course_count: number;
  no_class_days: WeekdayEnum[];
  selected_courses: CourseType[];
};
