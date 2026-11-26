import { CPSATFilterType } from "@/types/schemas/filter.schema";
import { StateCreator } from "zustand";
import { combine } from "zustand/middleware";

// "시간표 자동 생성"을 누른 순간의 조건. 추천 결과 쿼리의 키이자 요청 본문이 된다
export type CPSATRequestType = {
  filters: Pick<
    CPSATFilterType,
    | "semester_id"
    | "major_id"
    | "grade"
    | "day_or_night"
    | "no_class_days"
    | "has_lunch_break"
    | "personal_schedules"
    | "selected_courses"
  >;
  constraints: Pick<
    CPSATFilterType,
    | "max_credit"
    | "major_basic"
    | "major_required"
    | "major_elective"
    | "daily_lecture_limit"
  >;
};

export function buildCPSATRequest(values: CPSATFilterType): CPSATRequestType {
  return {
    filters: {
      semester_id: values.semester_id,
      major_id: values.major_id,
      grade: values.grade,
      day_or_night: values.day_or_night,
      no_class_days: values.no_class_days,
      has_lunch_break: values.has_lunch_break,
      personal_schedules: values.personal_schedules,
      selected_courses: values.selected_courses,
    },
    constraints: {
      max_credit: values.max_credit,
      major_basic: values.major_basic,
      major_required: values.major_required,
      major_elective: values.major_elective,
      daily_lecture_limit: values.daily_lecture_limit,
    },
  };
}

type CPSATRequestStateType = {
  // 아직 한 번도 누르지 않았으면 null (쿼리를 실행하지 않음)
  submittedCPSATRequest: CPSATRequestType | null;
};

type CPSATRequestActionType = {
  submitCPSATRequest: (request: CPSATRequestType) => void;
};

export type CPSATRequestSliceType = CPSATRequestStateType &
  CPSATRequestActionType;

const initialState: CPSATRequestStateType = {
  submittedCPSATRequest: null,
};

export const createCPSATRequestSlice: StateCreator<CPSATRequestSliceType> =
  combine(initialState, (set) => ({
    submitCPSATRequest: (request) => set({ submittedCPSATRequest: request }),
  }));
