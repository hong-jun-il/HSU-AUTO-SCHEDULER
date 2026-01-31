"use client";

import SangSangBoogi from "@/assets/SangSangBoogi.webp";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";
import useMarkCourseSchedule from "@/hooks/CourseFinder/PersonalSchedule/useMarkCourseSchedule";
import clsx from "clsx";
import Image from "next/image";
import CourseListLoading from "./CourseListLoading";
import CourseInfoCard from "./CourseInfoCard";
import { CourseType } from "@/types/schemas/course.schema";

type Props = {
  isLoading: boolean;
  courses?: CourseType[];
};

export default function CourseListForMobile({ isLoading, courses }: Props) {
  const { hoveredCourse, isOpen, setHoveredCourse, clearHoveredCourse } =
    useTimetableStore(
      useShallow((state) => ({
        hoveredCourse: state.hoveredCourse,
        isOpen: state.isOpen,
        setHoveredCourse: state.setHoveredCourse,
        clearHoveredCourse: state.clearHoveredCourse,
      })),
    );

  const handleClickCourseCard = (course: CourseType) => {
    if (hoveredCourse?.id === course.id) {
      clearHoveredCourse();
      return;
    }

    setHoveredCourse(course);
  };

  const { onClickCourse } = useMarkCourseSchedule();

  const currentFilters = useWatch();

  // 필터가 바뀌거나 isOpen이 바뀔 때 호버(클릭)된 강의 클리어
  useEffect(() => {
    if (hoveredCourse) {
      clearHoveredCourse();
    }

    return () => {
      clearHoveredCourse();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters, isOpen, clearHoveredCourse]);

  return (
    <>
      {isLoading ? (
        <CourseListLoading />
      ) : (
        courses &&
        (courses.length === 0 ? (
          <div
            className={clsx(
              "flex flex-col items-center justify-center",
              "h-4/5 w-full",
              "text-sm",
            )}
          >
            <div className="mb-2 h-auto w-25">
              <Image src={SangSangBoogi} alt="상상부기" />
            </div>
            검색 결과가 없습니다
          </div>
        ) : (
          <ul>
            {courses.map((course) => (
              <CourseInfoCard
                key={course.id}
                course={course}
                hoveredCourse={hoveredCourse}
                handleClickCourseCard={handleClickCourseCard}
                onAddCourse={onClickCourse}
              />
            ))}
          </ul>
        ))
      )}
    </>
  );
}
