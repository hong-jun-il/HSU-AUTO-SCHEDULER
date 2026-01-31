"use client";

import RHFTextInput from "@/components/RHF/RHFTextInput";
import { CustomInput } from "@/components/ui/CustomInput";
import RHFCustomSelect from "@/components/RHF/RHFCustomSelect";
import CloseIcon from "@/assets/icons/CloseIcon";
import clsx from "clsx";
import { Dispatch, SetStateAction, useState } from "react";
import useHorizontalScrollByWheel from "@/hooks/CourseFinder/Course/useHorizontalScrollByWheel";
import { SelectOptionType } from "@/types/selectOption.type";
import { WeekdayKorMap } from "@/enums/weekday.enum";
import useFixInputValues from "@/hooks/CourseFinder/Course/useFixInputValues";
import { useFormContext } from "react-hook-form";
import SearchModal from "./SearchModal";
import NoClassDaySelectModal from "./NoClassDaySelectModal";
import FilterActionBtns from "./FilterActionBtns";
import {
  CourseFilterType,
  CPSATFilterType,
} from "@/types/schemas/filter.schema";

type Props = {
  majorSelectedOptions: SelectOptionType[];
  gradeSelectOptions: SelectOptionType[];
  dayOrNightSelectOptions: SelectOptionType[];
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  searchModalIsOpen: boolean;
  noClassDaysSelectModalIsOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  openNoClassDaysModal: () => void;
  closeNoClassDaysModal: () => void;
  hasEnoughData: boolean;
};

export default function CourseFiltersForDesktop({
  majorSelectedOptions,
  gradeSelectOptions,
  dayOrNightSelectOptions,
  search,
  setSearch,
  searchModalIsOpen,
  noClassDaysSelectModalIsOpen,
  openSearchModal,
  closeSearchModal,
  openNoClassDaysModal,
  closeNoClassDaysModal,
  hasEnoughData,
}: Props) {
  const { getValues: courseFilterValues } = useFormContext<CourseFilterType>();

  const currentNoClassDays = courseFilterValues("no_class_days");

  const [isLeftEnded, setIsLeftEnded] = useState<boolean>(true);
  const [isRightEnded, setIsRightEnded] = useState<boolean>(false);

  const scrollRef = useHorizontalScrollByWheel(setIsLeftEnded, setIsRightEnded);

  const {
    fixValueMaxCreditOnBlur,
    fixValueMajorRequired,
    fixValueMajorBasicOnBlur,
    fixValueMajorElective,
    fixValueDailyLectureLimit,
  } = useFixInputValues();

  return (
    <div
      className={clsx(
        "bg-white p-6",
        "border-border-hsu rounded-2xl border-2",
        "flex items-center justify-between",
      )}
      style={{
        boxShadow: "0 2px 10px rgba(46, 92, 184, 0.1)",
      }}
    >
      <div className="relative w-full overflow-hidden">
        {/* 엣지 페이드 */}
        <div
          className={clsx(
            "absolute top-0 left-0 z-(--z-index-course-finder-edge-fader) h-full transition-all duration-75",
            !isLeftEnded ? "w-5" : "w-0",
          )}
          style={{
            background:
              "linear-gradient(to left, transparent 25%, var(--color-course-finder-main-bg) 100%)",
          }}
        />
        <div
          className={clsx(
            "absolute top-0 right-[10%] z-(--z-index-course-finder-edge-fader) h-full transition-all duration-75",
            !isRightEnded ? "w-5" : "w-0",
          )}
          style={{
            background:
              "linear-gradient(to right, transparent 0%, var(--color-course-finder-main-bg) 75%)",
          }}
        />

        {/* 필터 컨테이너 */}
        <div
          ref={scrollRef}
          className={clsx(
            "scrollbar-hidden flex gap-4 overflow-x-auto",
            "w-[90%]",
          )}
        >
          {/* 전공 필터 */}
          <RHFCustomSelect<CourseFilterType>
            name="major_id"
            items={majorSelectedOptions}
            placeholder="전공을 선택하세요"
            className="max-w-100 truncate"
          />

          {/* 검색 필터 */}
          <div
            className={clsx(
              "flex items-center pr-12 pl-4",
              "h-16 max-w-200",
              "text-xs",
              "bg-light-hsu border-border-hsu rounded-lg border-2",
              "relative cursor-pointer",
            )}
            onClick={openSearchModal}
          >
            <span className="truncate">검색어: {search ? search : "없음"}</span>
            {search && (
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch("");
                }}
              >
                <CloseIcon width={11} />
              </button>
            )}
          </div>

          {/* 학년 필터 */}
          <RHFCustomSelect<CourseFilterType>
            name="grade"
            items={gradeSelectOptions}
            placeholder="학년"
          />

          {/* 주야 필터 */}
          <RHFCustomSelect<CourseFilterType>
            name="day_or_night"
            items={dayOrNightSelectOptions}
            placeholder="주/야"
          />

          {/* 공강 필터 */}
          <CustomInput
            readOnly
            name="noClassDaysReadonlyInput"
            id="noClassDaysReadonlyInput"
            className="!w-fit"
            onClick={openNoClassDaysModal}
            value={`공강 요일: ${
              currentNoClassDays.length
                ? `${currentNoClassDays.map((day) => WeekdayKorMap[day]).join(", ")}`
                : "없음"
            }`}
          />

          {/* 최대 학점 필터 */}
          <RHFTextInput<CPSATFilterType>
            type="number"
            name="max_credit"
            id="max_credit"
            labelText="최대 학점:"
            className="!w-[3ch] rounded-none"
            placeholder="18"
            fixValueFuncOnBlur={fixValueMaxCreditOnBlur}
          />

          {/* 전공 기초 필터 */}
          <RHFTextInput<CPSATFilterType>
            type="number"
            name="major_basic"
            id="major_basic"
            labelText="전공 기초(최소 학점):"
            className="!w-[3ch] rounded-none"
            placeholder="0"
            fixValueFuncOnBlur={fixValueMajorBasicOnBlur}
          />

          {/* 전공 필수 필터 */}
          <RHFTextInput<CPSATFilterType>
            type="number"
            name="major_required"
            id="major_required"
            labelText="전공 필수(최소 학점):"
            className="!w-[3ch] rounded-none"
            placeholder="0"
            fixValueFuncOnBlur={fixValueMajorRequired}
          />

          {/* 전공 선택 필터 */}
          <RHFTextInput<CPSATFilterType>
            type="number"
            name="major_elective"
            id="major_elective"
            labelText="전공 선택(최소 학점):"
            className="!w-[3ch] rounded-none"
            placeholder="0"
            fixValueFuncOnBlur={fixValueMajorElective}
          />

          {/* 하루 최대 강의 수 필터 */}
          <RHFTextInput<CPSATFilterType>
            type="number"
            name="daily_lecture_limit"
            id="daily_lecture_limit"
            labelText="하루 최대 강의 제한:"
            className="!w-[3ch] rounded-none"
            placeholder="3"
            fixValueFuncOnBlur={fixValueDailyLectureLimit}
          />

          {/* 점심 보장 필터 */}
          <RHFTextInput<CourseFilterType>
            type="checkbox"
            name="has_lunch_break"
            id="has_lunch_break"
            labelText="점심 보장(12시~13시):"
            className="!w-[3ch] rounded-none"
          />

          {searchModalIsOpen && (
            <SearchModal
              closeSearchModal={closeSearchModal}
              search={search}
              setSearch={setSearch}
            />
          )}

          {noClassDaysSelectModalIsOpen && (
            <NoClassDaySelectModal
              closeNoClassDaysModal={closeNoClassDaysModal}
            />
          )}
        </div>
      </div>

      <FilterActionBtns hasEnoughData={hasEnoughData} setSearch={setSearch} />
    </div>
  );
}
