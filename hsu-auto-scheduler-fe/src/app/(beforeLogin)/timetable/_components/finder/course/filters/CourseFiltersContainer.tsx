"use client";

import { useGetMajors } from "@/hooks/queries/useGetMajors";
import { SelectOptionType } from "@/types/selectOption.type";
import { DayOrNightEnum, DayOrNightKorMap } from "@/enums/day_or_night.enum";
import { Dispatch, SetStateAction, useState } from "react";
import { useResponsiveContext } from "@/components/ResponsiveProvider";
import CourseFiltersForDesktop from "./CourseFiltersForDesktop";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import CourseFiltersForMobile from "./CourseFiltersForMobile";

type Props = {
  hasEnoughData: boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
};

export default function CourseFilters({
  hasEnoughData,
  search,
  setSearch,
}: Props) {
  // 필터: 전공, 학년, 주야, 공강 요일,
  // 최대 학점,
  // 전공 기초, 전공 필수, 전공 선택, 하루 최대 강의 수, 점심시간 보장
  const currentSemester = useCurrentSemester();
  const deviceType = useResponsiveContext();

  const [searchModalIsOpen, setSearchModalIsOpen] = useState<boolean>(false);
  const [noClassDaysSelectModalIsOpen, setNoClassDaysSelectModalIsOpen] =
    useState<boolean>(false);

  // 해당 학기의 모든 전공들을 가져오는 훅
  const { data: getMajorsResponse, isFetching: getMajorsFetching } =
    useGetMajors(currentSemester);

  if (getMajorsFetching) {
    return <div className="h-40 w-full" />;
  }

  // 전공 선택 리스트
  const majorSelectedOptions: SelectOptionType[] =
    getMajorsResponse?.data.map((major) => ({
      value: major.id,
      label: `[${major.code}] ${major.name}`,
    })) ?? [];

  // 학년 선택 리스트
  const gradeSelectOptions: SelectOptionType[] = Array.from({ length: 4 }).map(
    (_, i) => ({
      value: i + 1,
      label: i + 1,
    }),
  );

  // 주야 선택 리스트
  const dayOrNightSelectOptions: SelectOptionType[] = [
    DayOrNightEnum.DAY,
    DayOrNightEnum.NIGHT,
  ]
    .slice(0, 2)
    .map((e) => ({
      value: e,
      label: DayOrNightKorMap[e],
    }));

  const openSearchModal = () => {
    setSearchModalIsOpen(true);
  };

  const closeSearchModal = () => {
    setSearchModalIsOpen(false);
  };

  const openNoClassDaysModal = () => {
    setNoClassDaysSelectModalIsOpen(true);
  };

  const closeNoClassDaysModal = () => {
    setNoClassDaysSelectModalIsOpen(false);
  };

  return (
    <>
      {deviceType === "desktop" ? (
        <CourseFiltersForDesktop
          majorSelectedOptions={majorSelectedOptions}
          gradeSelectOptions={gradeSelectOptions}
          dayOrNightSelectOptions={dayOrNightSelectOptions}
          search={search}
          setSearch={setSearch}
          searchModalIsOpen={searchModalIsOpen}
          noClassDaysSelectModalIsOpen={noClassDaysSelectModalIsOpen}
          openSearchModal={openSearchModal}
          closeSearchModal={closeSearchModal}
          openNoClassDaysModal={openNoClassDaysModal}
          closeNoClassDaysModal={closeNoClassDaysModal}
          hasEnoughData={hasEnoughData}
        />
      ) : (
        <CourseFiltersForMobile
          majorSelectedOptions={majorSelectedOptions}
          gradeSelectOptions={gradeSelectOptions}
          dayOrNightSelectOptions={dayOrNightSelectOptions}
          search={search}
          setSearch={setSearch}
          searchModalIsOpen={searchModalIsOpen}
          noClassDaysSelectModalIsOpen={noClassDaysSelectModalIsOpen}
          openSearchModal={openSearchModal}
          closeSearchModal={closeSearchModal}
          openNoClassDaysModal={openNoClassDaysModal}
          closeNoClassDaysModal={closeNoClassDaysModal}
          hasEnoughData={hasEnoughData}
        />
      )}
    </>
  );
}
