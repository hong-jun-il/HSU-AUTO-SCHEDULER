import { CourseType } from "@/types/schemas/course.schema";
import { StateCreator } from "zustand";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type SelectedCourseStateType = {
  selectedCourses: Record<string, CourseType[]>;
};

type SelectedCourseActionType = {
  ensureSelectedCoursesSemesterInitialized: (semester: string) => void;
  isCourseAdded: (semester: string, courseId: string) => boolean;
  addCourse: (semester: string, course: CourseType) => void;
  deleteCourse: (semester: string, courseId: string) => void;
  resetSelectedCourses: (semester: string) => void;
};

export type SelectedCourseSliceType = SelectedCourseStateType &
  SelectedCourseActionType;

const initialState: SelectedCourseStateType = {
  selectedCourses: {},
};

export const createSelectedCourseSlice: StateCreator<
  SelectedCourseSliceType,
  [],
  [["zustand/immer", never]],
  SelectedCourseSliceType
> = immer(
  combine(initialState, (set, get) => ({
    ensureSelectedCoursesSemesterInitialized: (semester: string) => {
      const selectedCoursesInCurSemester = get().selectedCourses[semester];

      if (!selectedCoursesInCurSemester) {
        set((state) => {
          state.selectedCourses[semester] = [];
        });
      }
    },
    isCourseAdded: (semester: string, courseId: string) => {
      const semesterCourses = get().selectedCourses[semester] ?? [];
      return semesterCourses.some((c) => c.id === courseId);
    },
    addCourse: (semester: string, course: CourseType) =>
      set((state) => {
        const semesterCourses = state.selectedCourses[semester] ?? [];
        semesterCourses.push(course);
        state.selectedCourses[semester] = semesterCourses;
      }),
    deleteCourse: (semester: string, courseId: string) => {
      set((state) => {
        const semesterCourses = state.selectedCourses[semester] ?? [];
        state.selectedCourses[semester] = semesterCourses.filter(
          (c) => c.id !== courseId,
        );
      });
    },
    resetSelectedCourses: (semester: string) => {
      set((state) => {
        state.selectedCourses[semester] = [];
      });
    },
  })),
);
