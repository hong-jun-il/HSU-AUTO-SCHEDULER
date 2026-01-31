import { CourseType } from "@/types/schemas/course.schema";
import { StateCreator } from "zustand";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type HoveredCourseStateType = {
  hoveredCourse: CourseType | null;
};

type HoveredCourseActionType = {
  setHoveredCourse: (hoveredCourse: CourseType) => void;
  clearHoveredCourse: () => void;
};

export type HoveredCourseSliceType = HoveredCourseStateType &
  HoveredCourseActionType;

const initialState: HoveredCourseStateType = {
  hoveredCourse: null,
};

export const createHoveredCourseSlice: StateCreator<
  // 전체 store 타입
  HoveredCourseSliceType,
  // 이전에 적용된 미들웨어의 튜플
  [],
  // 지금 적용될 미들웨어의 튜플
  [["zustand/immer", never]],
  // 최종 결과로 나올 state 타입
  HoveredCourseSliceType
> = immer(
  combine(initialState, (set) => ({
    setHoveredCourse: (hoveredCourse: CourseType) =>
      set((state) => {
        state.hoveredCourse = hoveredCourse;
      }),
    clearHoveredCourse: () =>
      set((state) => {
        state.hoveredCourse = null;
      }),
  })),
);
