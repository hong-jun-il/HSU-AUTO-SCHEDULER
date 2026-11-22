import { DayOrNightEnum } from "./enums/day_or_night.enum";
import { DeliveryMethodEnum } from "./enums/delivery_method.enum";
import { RequirementTypeEnum } from "./enums/requirement_type.enum";
import { TimePlaceDBType } from "./timeplace.type";

// 백엔드 save-courses API로 보내는 강의 한 개
export type CourseDBType = {
  code: string;
  name: string;
  credit: number;
  requirement_type: RequirementTypeEnum;
  grade: number;
  grade_limit: number | null;
  section: string;
  delivery_method: DeliveryMethodEnum;
  day_or_night: DayOrNightEnum;
  professors: string;
  online_hour: number;
  plan_code: string | null;
  remark: string | null;
  offline_schedules: TimePlaceDBType[];
};
