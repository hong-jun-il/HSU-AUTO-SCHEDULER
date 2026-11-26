import { CourseType } from "@/types/schemas/course.schema";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/*
  강의 목록에서 마우스를 올린 강의(시간표 미리보기용)
  마우스를 움직일 때마다 바뀌는 잠깐 쓰는 UI 상태라서 persist 하는 timetableStore 와 분리한다
  - 같은 store 에 있으면 값이 바뀔 때마다 persist 가 localStorage 에 전체 상태를 다시 쓴다
  - 시간표 전체가 이 값을 구독하지 않고, 요일 칸의 HoveredCourseBlock 만 구독한다
*/
type HoveredCourseStoreType = {
  hoveredCourse: CourseType | null;
  setHoveredCourse: (hoveredCourse: CourseType) => void;
  clearHoveredCourse: () => void;
};

export const useHoveredCourseStore = create<HoveredCourseStoreType>()(
  devtools(
    (set) => ({
      hoveredCourse: null,
      setHoveredCourse: (hoveredCourse) => set({ hoveredCourse }),
      clearHoveredCourse: () => set({ hoveredCourse: null }),
    }),
    { name: "HoveredCourse-Store" },
  ),
);
