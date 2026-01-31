import { DAY_BLOCK_LENGTH } from "@/constants/day-block-length.const";
import { WeekdayEnum } from "@/enums/weekday.enum";
import { StateCreator } from "zustand";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type TimeSelectionsType = Record<WeekdayEnum, number[]>;

type TimeSelectionStateType = {
  timeSelections: Record<string, TimeSelectionsType>;
};

type TimeSelectionActionType = {
  ensureTimeSelectionInitialized: (semester: string) => void;
  addTimeRange: (
    semester: string,
    day: WeekdayEnum,
    startIndex: number,
    endIndex: number,
  ) => void;
  deleteTimeRange: (
    semester: string,
    day: WeekdayEnum,
    startIndex: number,
    endIndex: number,
  ) => void;
  resetTimeSelection: (semester: string) => void;
};

export type TimeSelectionSliceType = TimeSelectionStateType &
  TimeSelectionActionType;

const initialState: TimeSelectionStateType = {
  timeSelections: {},
};

export const createTimeSelectionSlice: StateCreator<
  TimeSelectionSliceType,
  [],
  [["zustand/immer", never]],
  TimeSelectionSliceType
> = immer(
  combine(initialState, (set, get) => ({
    ensureTimeSelectionInitialized: (semester) => {
      const current = get().timeSelections[semester];
      if (!current) {
        set((state) => {
          state.timeSelections[semester] = Object.values(WeekdayEnum).reduce(
            (acc, day) => {
              acc[day] = Array(DAY_BLOCK_LENGTH).fill(0);
              return acc;
            },
            {} as Record<WeekdayEnum, number[]>,
          );
        });
      }
    },
    addTimeRange: (semester, day, startIndex, endIndex) => {
      set((state) => {
        const currentTimetableSelections = state.timeSelections[semester];

        if (!currentTimetableSelections) {
          throw new Error(`${semester}에 해당하는 timetable이 없습니다`);
        }

        const timeSelectionsInCurDay = currentTimetableSelections[day];

        if (timeSelectionsInCurDay) {
          for (let i = startIndex; i < endIndex; i++) {
            timeSelectionsInCurDay[i] = 1;
          }
        }
      });
    },
    deleteTimeRange: (semester, day, startIndex, endIndex) => {
      set((state) => {
        const currentTimetableSelections = state.timeSelections[semester];

        if (!currentTimetableSelections) {
          throw new Error(`${semester}에 해당하는 timetable이 없습니다`);
        }

        const timeSelectionsInCurDay = currentTimetableSelections[day];

        if (timeSelectionsInCurDay) {
          for (let i = startIndex; i < endIndex; i++) {
            timeSelectionsInCurDay[i] = 0;
          }
        }
      });
    },
    resetTimeSelection: (semester: string) => {
      set((state) => {
        state.timeSelections[semester] = Object.values(WeekdayEnum).reduce(
          (acc, day) => {
            acc[day] = Array(DAY_BLOCK_LENGTH).fill(0);
            return acc;
          },
          {} as Record<WeekdayEnum, number[]>,
        );
      });
    },
  })),
);
