"use client";

import SangSangBoogi from "@/assets/SangSangBoogi.webp";
import clsx from "clsx";
import Image from "next/image";
import { useHoveredCourseStore } from "@/store/hoveredCourse/hoveredCourseStore";
import { useShallow } from "zustand/shallow";
import useMarkCourseSchedule from "@/hooks/CourseFinder/PersonalSchedule/useMarkCourseSchedule";
import CourseListLoading from "./CourseListLoading";
import CourseInfoTableRow from "./CourseInfoTableRow";
import { CourseType } from "@/types/schemas/course.schema";
import useProgressiveList from "@/hooks/common/useProgressiveList";
import { COURSE_TABLE_GRID_COLUMNS } from "./courseTableGrid";

// 1,400여 행을 한 번에 그리면 메인 스레드가 오래 멈춘다(<table> 시절 CPU 4배 저하에서 약 320ms).
// 200행씩이면 덩어리마다 50~60ms 라 아직 긴 작업이 남고, 120행씩이면 긴 작업(50ms 초과)이 거의 사라진다
const FIRST_ROWS = 50;
const ROWS_PER_CHUNK = 120;

const HEADER_LABELS = [
  "과목코드",
  "과목명",
  "교수",
  "학년",
  "학년제한",
  "학점",
  "과목구분",
  "이수구분",
  "주/야",
  "강의 스케줄",
  "강의 계획서",
];

type Props = {
  isLoading: boolean;
  courses?: CourseType[];
};

export default function CourseListForDesktop({ isLoading, courses }: Props) {
  const { setHoveredCourse, clearHoveredCourse } = useHoveredCourseStore(
    useShallow((state) => ({
      setHoveredCourse: state.setHoveredCourse,
      clearHoveredCourse: state.clearHoveredCourse,
    })),
  );
  const { onClickCourse } = useMarkCourseSchedule();
  const visibleCourses = useProgressiveList(
    courses,
    FIRST_ROWS,
    ROWS_PER_CHUNK,
  );

  return (
    // 헤더는 고정하고 강의 행만 스크롤한다.
    // 두 영역 모두 scrollbar-gutter: stable 로 스크롤바 폭만큼 자리를 똑같이 비워 두어 열 경계를 맞춘다
    <div
      role="table"
      aria-label="강의 목록"
      className="flex h-full w-full flex-col"
    >
      <div
        role="rowgroup"
        className="shrink-0 overflow-y-hidden [scrollbar-gutter:stable]"
      >
        <div
          role="row"
          className={clsx(
            "grid h-18 w-full text-xs font-semibold text-white",
            "[&>div]:flex [&>div]:items-center [&>div]:justify-center",
            "[&>div]:bg-[linear-gradient(135deg,var(--color-hsu)_0%,var(--color-deep-hsu)_100%)]",
          )}
          style={{ gridTemplateColumns: COURSE_TABLE_GRID_COLUMNS }}
        >
          {HEADER_LABELS.map((label) => (
            <div key={label} role="columnheader">
              {label}
            </div>
          ))}
        </div>
      </div>

      <div
        role="rowgroup"
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]"
      >
        {isLoading ? (
          <CourseListLoading />
        ) : (
          courses &&
          (courses.length === 0 ? (
            <div className="text-md flex h-100 w-full flex-col items-center justify-center bg-white">
              <div className="mb-2 h-auto w-25">
                <Image src={SangSangBoogi} alt="상상부기" />
              </div>
              검색 결과가 없습니다
            </div>
          ) : (
            visibleCourses?.map((course) => (
              <CourseInfoTableRow
                key={course.id}
                course={course}
                setHoveredCourse={setHoveredCourse}
                clearHoveredCourse={clearHoveredCourse}
                onClickCourse={onClickCourse}
              />
            ))
          ))
        )}
      </div>
    </div>
  );
}
