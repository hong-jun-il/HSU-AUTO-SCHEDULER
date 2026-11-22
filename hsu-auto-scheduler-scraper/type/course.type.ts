import { DayOrNightEnum } from "./enums/day_or_night.enum";
import { DeliveryMethodEnum } from "./enums/delivery_method.enum";
import { RequirementTypeEnum } from "./enums/requirement_type.enum";
import {
  TimePlaceDBType,
  TimePlaceFileType,
  TimePlaceXMLType,
} from "./timeplace.type";

// XML용 타입
export type CourseXMLType = {
  timeplace?: TimePlaceXMLType[];
  "@_id": string;
  "@_code": string;
  "@_name": string;
  "@_professor": string;
  "@_type": string;
  "@_grade": string;
  "@_time": string;
  "@_place": string;
  "@_credit": string;
  "@_popular": string;
  "@_target": string;
  "@_notice": string;
  "@_lectureId": string;
  "@_lectureRate": string;
  "@_misc1": string;
  "@_misc2": string;
  "@_misc3": string;
  "@_misc4": string;
};

// json 파일 저장용 타입(에브리타임 크롤링 시 만들어진 파일 내의 타입)
export type EverytimeCourseType = {
  timeplace?: TimePlaceFileType[];
  id: string;
  code: string;
  name: string;
  professor: string;
  type: string;
  grade: string;
  time: string;
  place: string;
  credit: number;
  popular: number;
  target: string;
  notice: string;
  lectureId: string;
  lectureRate: string;
  misc1: string;
  misc2: string;
  misc3: string;
  misc4: string;
};

// 종정시 크롤링 아후 학년, 이수 구분, 강의 계획서를 덮어쓴 타입
export type OverridedCourseType = Omit<EverytimeCourseType, "grade"> & {
  grade: number;
  remark: string | null;
  plan_code: string | null;
};

// 실제 db에 보낼 타입
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
