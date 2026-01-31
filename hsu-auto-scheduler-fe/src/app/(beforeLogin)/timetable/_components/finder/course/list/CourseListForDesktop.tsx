"use client";

import SangSangBoogi from "@/assets/SangSangBoogi.webp";
import clsx from "clsx";
import Image from "next/image";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import useMarkCourseSchedule from "@/hooks/CourseFinder/PersonalSchedule/useMarkCourseSchedule";
import CourseListLoading from "./CourseListLoading";
import CourseInfoTableRow from "./CourseInfoTableRow";
import { CourseType } from "@/types/schemas/course.schema";

type Props = {
  isLoading: boolean;
  courses?: CourseType[];
};

export default function CourseListForDesktop({ isLoading, courses }: Props) {
  const { setHoveredCourse, clearHoveredCourse } = useTimetableStore(
    useShallow((state) => ({
      setHoveredCourse: state.setHoveredCourse,
      clearHoveredCourse: state.clearHoveredCourse,
    })),
  );
  const { onClickCourse } = useMarkCourseSchedule();

  return (
    <>
      <table
        className={clsx(
          "sticky top-0 h-18 w-full table-fixed",
          "[&_th]:text-xs [&_th]:text-white",
          "[&_th]:font-semibold",
        )}
      >
        <colgroup
          className={clsx(
            "[&_col]:bg-[linear-gradient(135deg,var(--color-hsu)_0%,var(--color-deep-hsu)_100%)]",
          )}
        >
          {/* 과목코드 */}
          <col className="w-50" />
          {/* 과목명 */}
          <col className="min-w-50" />
          {/* 교수 */}
          <col className="w-48" />
          {/* 학년 */}
          <col className="w-31" />
          {/* 학년제한 */}
          <col className="w-30" />
          {/* 학점 */}
          <col className="w-20" />
          {/* 과목구분 */}
          <col className="w-31" />
          {/* 이수구분 */}
          <col className="w-33" />
          {/* 주/야 */}
          <col className="w-20" />
          {/* 강의 스케줄 */}
          <col className="min-w-130" />
          {/* 강의 계획서 */}
          <col className="w-42" />
        </colgroup>
        <thead>
          <tr>
            <th>과목코드</th>
            <th>과목명</th>
            <th>교수</th>
            <th>학년</th>
            <th>학년제한</th>
            <th>학점</th>
            <th>과목구분</th>
            <th>이수구분</th>
            <th>주/야</th>
            <th>강의 스케줄</th>
            <th>강의 계획서</th>
          </tr>
        </thead>
      </table>

      {isLoading ? (
        <CourseListLoading />
      ) : (
        <table className="w-full table-fixed border-collapse [&_tr]:h-22">
          <colgroup>
            {/* 과목코드 */}
            <col className="w-50" />
            {/* 과목명 */}
            <col className="min-w-50" />
            {/* 교수 */}
            <col className="w-48" />
            {/* 학년 */}
            <col className="w-31" />
            {/* 학년제한 */}
            <col className="w-30" />
            {/* 학점 */}
            <col className="w-20" />
            {/* 과목구분 */}
            <col className="w-31" />
            {/* 이수구분 */}
            <col className="w-33" />
            {/* 주/야 */}
            <col className="w-20" />
            {/* 강의 스케줄 */}
            <col className="min-w-130" />
            {/* 강의 계획서 */}
            <col className="w-42" />
          </colgroup>
          <tbody className="[&_td]:text-center">
            {courses &&
              (courses.length === 0 ? (
                <tr className="text-md !h-100 bg-white">
                  <td colSpan={10}>
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="mb-2 h-auto w-25">
                        <Image src={SangSangBoogi} alt="상상부기" />
                      </div>
                      검색 결과가 없습니다
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <CourseInfoTableRow
                    key={course.id}
                    course={course}
                    setHoveredCourse={setHoveredCourse}
                    clearHoveredCourse={clearHoveredCourse}
                    onClickCourse={onClickCourse}
                  />
                ))
              ))}
          </tbody>
        </table>
      )}
    </>
  );
}
