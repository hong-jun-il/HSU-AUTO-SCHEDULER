import { DayOrNightEnum } from "./dayOrNight.enum";
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

// json 파일 저장용 타입
export type CourseFileType = {
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

// 실제 db에 보낼 타입
export type CourseDBType = {
  semester_id: string; // 학기 아이디: string
  course_code: string; // 강의코드: string
  course_name: string; // 강의명: string
  professor_names: string; // 교수 이름: string 배열
  completion_type: string; // 이수 구분(전필, 전선, 복전선, 일선): string
  delivery_method: string; // 강의 구분(온라인100%, BL, 대면수업): string
  credit: number; // 학점: number
  day_or_night: DayOrNightEnum; // 주야구분: enum
  class_section: string; // 분반: string
  grade: string; // 학년(1, 2, 3, 4학년 또는 전학년(0으로)): string
  grade_limit: number | null; // 학년 제한: number 또는 null
  online_hour: number; // 온라인 시간: number
  offline_schedules: TimePlaceDBType[]; // 오프라인 스케줄
  // plan_code: string; // 강의 계획서 code string 또는 null
};
