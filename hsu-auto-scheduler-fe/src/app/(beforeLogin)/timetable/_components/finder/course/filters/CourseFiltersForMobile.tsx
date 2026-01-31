"use client";

import { SelectOptionType } from "@/types/selectOption.type";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";
import DropDownArrow from "@/assets/icons/DropDownArrow";
import CloseIcon from "@/assets/icons/CloseIcon";
import RHFCustomSelectForMobile from "@/components/RHF/RHFCustomSelectForMobile";
import useFixInputValues from "@/hooks/CourseFinder/Course/useFixInputValues";
import { useFormContext } from "react-hook-form";
import { WeekdayKorMap } from "@/enums/weekday.enum";
import RHFTextInputForMobile from "@/components/RHF/RHFTextInputForMobile";
import RHFCheckbox from "@/components/RHF/RHFCheckbox";
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

export default function CourseFiltersForMobile({
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
  const [filterIsOpen, setFilterIsOpen] = useState<boolean>(false);

  const { getValues } = useFormContext<CourseFilterType>();

  const currentNoClassDays = getValues("no_class_days");

  const handleFilterOpen = () => {
    setFilterIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (search !== "") {
      setFilterIsOpen(false);
    }
  }, [search, setFilterIsOpen]);

  const {
    fixValueMaxCreditOnBlur,
    fixValueMajorRequired,
    fixValueMajorBasicOnBlur,
    fixValueMajorElective,
    fixValueDailyLectureLimit,
  } = useFixInputValues();

  return (
    <div className={clsx("relative h-20")}>
      <div
        className={clsx(
          "absolute z-50",
          "w-full",
          "border-border-hsu bg-light-hsu rounded-lg border-2",
        )}
      >
        <button
          type="button"
          className={clsx(
            "flex items-center justify-between",
            "h-20 w-full px-5",
            "text-sm",
          )}
          onClick={handleFilterOpen}
        >
          <div className="">
            <span className={clsx("aspect-square h-50 p-1 text-sm")}>⚙️</span>
            <span className="text-gray-500">상세 필터</span>
          </div>

          <div
            className={clsx(
              "flex items-center",
              "transition-transform duration-200",
              filterIsOpen && "rotate-z-180",
            )}
          >
            <DropDownArrow width={13} />
          </div>
        </button>

        <div
          className={clsx(
            "overflow-y-auto",
            "transition-all duration-400",
            filterIsOpen ? "max-h-[35dvh] opacity-100" : "max-h-0 opacity-0",
          )}
          style={{
            scrollbarGutter: "stable",
          }}
        >
          <div className="grid grid-cols-2 gap-6 px-8 py-10">
            {/* 검색 필드 */}
            <div>
              <span className="text-hsu mb-2 ml-2 block text-xs font-bold">
                🔍 검색
              </span>

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
                <span className="truncate">
                  검색어: {search ? search : "없음"}
                </span>

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
            </div>

            {/* 전공 필드 */}
            <RHFCustomSelectForMobile<CPSATFilterType>
              name="major_id"
              items={majorSelectedOptions}
              labelText="📚 전공"
              placeholder="전체"
            />

            {/* 학년 필드 */}
            <RHFCustomSelectForMobile<CPSATFilterType>
              name="grade"
              items={gradeSelectOptions}
              labelText="🎓 학년"
              placeholder="전체"
            />

            {/* 주야 필드 */}
            <RHFCustomSelectForMobile<CPSATFilterType>
              name="day_or_night"
              items={dayOrNightSelectOptions}
              labelText="🌙 주야"
              placeholder="전체"
            />

            {/* 공강 요일 필드 */}
            <div>
              <span className="text-hsu mb-2 ml-2 block text-xs font-bold">
                📅 공강 요일
              </span>
              <span
                className={clsx(
                  "flex items-center pr-12 pl-4",
                  "h-16 max-w-200",
                  "text-xs",
                  "bg-light-hsu border-border-hsu rounded-lg border-2",
                  "relative cursor-pointer",
                )}
                onClick={openNoClassDaysModal}
              >
                {currentNoClassDays.length
                  ? `${currentNoClassDays.map((day) => WeekdayKorMap[day]).join(", ")}`
                  : "없음"}
              </span>
            </div>

            {/* 최대 학점 필드 */}
            <RHFTextInputForMobile<CPSATFilterType>
              type="number"
              name="max_credit"
              id="max_credit"
              labelText="⭐ 최대 학점"
              placeholder="18"
              fixValueFuncOnBlur={fixValueMaxCreditOnBlur}
            />

            {/* 전공 기초 필드 */}
            <RHFTextInputForMobile<CPSATFilterType>
              type="number"
              name="major_basic"
              id="major_basic"
              labelText="⭐ 전공 기초(최소 학점)"
              placeholder="0"
              fixValueFuncOnBlur={fixValueMajorBasicOnBlur}
            />

            {/* 전공 필수 필드 */}
            <RHFTextInputForMobile<CPSATFilterType>
              type="number"
              name="major_required"
              id="major_required"
              labelText="⭐ 전공 필수(최소 학점)"
              placeholder="0"
              fixValueFuncOnBlur={fixValueMajorRequired}
            />

            {/* 전공 선택 필드 */}
            <RHFTextInputForMobile<CPSATFilterType>
              type="number"
              name="major_elective"
              id="major_elective"
              labelText="⭐ 전공 선택(최소 학점)"
              placeholder="0"
              fixValueFuncOnBlur={fixValueMajorElective}
            />

            <RHFTextInputForMobile<CPSATFilterType>
              type="number"
              name="daily_lecture_limit"
              id="daily_lecture_limit"
              labelText="📋 하루 최대 강의 제한"
              placeholder="3"
              fixValueFuncOnBlur={fixValueDailyLectureLimit}
            />

            {/* 점심 보장 필터 */}
            <RHFCheckbox<CPSATFilterType>
              type="checkbox"
              name="has_lunch_break"
              id="has_lunch_break"
              labelText="🕐 점심 보장(12시~13시)"
            />
          </div>
          <div className="px-5 pb-5">
            <FilterActionBtns
              hasEnoughData={hasEnoughData}
              setSearch={setSearch}
            />
          </div>
        </div>
      </div>

      {searchModalIsOpen && (
        <SearchModal
          closeSearchModal={closeSearchModal}
          search={search}
          setSearch={setSearch}
        />
      )}

      {noClassDaysSelectModalIsOpen && (
        <NoClassDaySelectModal closeNoClassDaysModal={closeNoClassDaysModal} />
      )}
    </div>
  );
}
