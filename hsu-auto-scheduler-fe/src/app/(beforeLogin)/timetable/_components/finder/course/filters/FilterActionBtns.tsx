"use client";

import { useFormContext } from "react-hook-form";

import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";
import FetchCPSATResult from "./FetchCPSATResult";
import {
  CPSATFilterDefaultValues,
  CPSATFilterType,
} from "@/types/schemas/filter.schema";

type Props = {
  hasEnoughData: boolean;
  setSearch: Dispatch<SetStateAction<string>>;
};

export default function FilterActionBtns({ hasEnoughData, setSearch }: Props) {
  const currentSemester = useCurrentSemester();

  const { reset } = useFormContext<CPSATFilterType>();
  const { selectedCourses, personalSchedules } = useTimetableStore(
    useShallow((state) => ({
      selectedCourses: state.selectedCourses,
      personalSchedules: state.personalSchedules,
    })),
  );

  const onReset = () => {
    const shouldReset = confirm("필터를 초기화 하시겠습니까?");

    if (!shouldReset) {
      return;
    }

    const {
      semester_id: _,
      selected_courses: __,
      personal_schedules: ___,
      ...rest
    } = CPSATFilterDefaultValues;

    setSearch("");
    reset({
      semester_id: currentSemester,
      selected_courses: selectedCourses[currentSemester],
      personal_schedules: personalSchedules[currentSemester],
      ...rest,
    });
  };

  return (
    <div
      className={clsx(
        "flex gap-2",
        "[&_button]:bg-hsu [&_button]:h-fit [&_button]:rounded-lg [&_button]:px-3 [&_button]:py-5",
        "[&_button]:text-xs [&_button]:whitespace-nowrap [&_button]:text-white",
        "max-md:[&_button]:border-2",
        "max-md:w-full",
      )}
    >
      <button
        onClick={onReset}
        className={clsx(
          "max-md:flex-1/3",
          "max-md:!text-hsu-black-500 max-md:!bg-light-hsu",
          "max-md:border-border-hsu",
        )}
      >
        필터 초기화
      </button>
      <FetchCPSATResult hasEnoughData={hasEnoughData} />
    </div>
  );
}
