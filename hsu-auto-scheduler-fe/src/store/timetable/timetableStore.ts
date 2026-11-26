import { create } from "zustand";
import {
  CourseFinderSliceType,
  createCourseFinderSlice,
} from "./courseFinder.slice";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import {
  createSelectedCourseSlice,
  SelectedCourseSliceType,
} from "./selectedCourse.slice";
import {
  createTimeSelectionSlice,
  TimeSelectionSliceType,
} from "./timeSelections.slice";
import {
  createPersonalScheduleModalSlice,
  PersonalScheduleModalSliceType,
} from "./personalScheduleModal.slice";
import {
  createPersonalScheduleSlice,
  PersonalScheduleSliceType,
} from "./personalSchedule.slice";

type TimetableStoreType = CourseFinderSliceType &
  SelectedCourseSliceType &
  PersonalScheduleModalSliceType &
  PersonalScheduleSliceType &
  TimeSelectionSliceType;

export const useTimetableStore = create<TimetableStoreType>()(
  devtools(
    persist(
      subscribeWithSelector((...a) => ({
        ...createCourseFinderSlice(...a),
        ...createSelectedCourseSlice(...a),
        ...createPersonalScheduleModalSlice(...a),
        ...createPersonalScheduleSlice(...a),
        ...createTimeSelectionSlice(...a),
      })),
      {
        name: "Scheduler-Store",
        partialize: (state) => ({
          selectedCourses: state.selectedCourses,
          personalSchedules: state.personalSchedules,
          timeSelections: state.timeSelections,
        }),
      },
    ),
  ),
);
