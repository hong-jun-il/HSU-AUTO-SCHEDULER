"use client";

import getMajors from "@/api/getMajors";
import CustomSelectBox from "@/components/ui/CustomSelectBox";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { CPSATFilterType } from "@/types/schemas/filter.schema";
import { SelectOptionType } from "@/types/selectOption.type";
import { SemesterType } from "@/types/semester.type";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/shallow";

type Props = {
  semesters: SemesterType[];
};

export default function RHFSelectSemester({ semesters }: Props) {
  // useEffect를 사용한 prefetch 때문에 해당 컴포넌트는  RHFCustomSelect를 사용하지 못함
  // 전용 컴포넌트로 남김
  const queryClient = useQueryClient();
  const router = useRouter();

  const currentSemester = useCurrentSemester();
  const { ensureTimeSelectionInitialized } = useTimetableStore(
    useShallow((state) => ({
      ensureTimeSelectionInitialized: state.ensureTimeSelectionInitialized,
    })),
  );
  const { control } = useFormContext<CPSATFilterType>();

  const selectBoxOptions: SelectOptionType[] = semesters.map((semester) => ({
    value: `${semester.id}`,
    label: `${semester.year}년 ${semester.term}학기`,
  }));

  const handleChangeSemester = (semester: string) => {
    router.replace(`/timetable?semester=${semester}`);
  };

  const handleSelectChange = (
    e: ChangeEvent<HTMLSelectElement>,
    RHFOnChange: (value: string) => void,
  ) => {
    RHFOnChange(e.target.value);
    handleChangeSemester(e.target.value);
  };

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["majors", currentSemester],
      queryFn: () => getMajors(currentSemester),
    });

    ensureTimeSelectionInitialized(currentSemester);
  }, [currentSemester, queryClient, ensureTimeSelectionInitialized]);

  return (
    <Controller
      name="semester_id"
      control={control}
      render={({ field }) => (
        <CustomSelectBox
          {...field}
          items={selectBoxOptions}
          placeholder="학기"
          onChange={(e) => handleSelectChange(e, field.onChange)}
          className="!h-14 border-none bg-white focus:border-none"
        />
      )}
    />
  );
}
