"use client";

import SpinSangSangBoogi from "@/components/ui/SpinSangSangBoogi";
import { useInfiniteScroll } from "@/hooks/CourseFinder/Course/useInfinityScroll";
import CourseListForDesktop from "./CourseListForDesktop";
import clsx from "clsx";
import { useResponsiveContext } from "@/components/ResponsiveProvider";
import CourseListForMobile from "./CourseListForMobile";
import { CourseType } from "@/types/schemas/course.schema";

type Props = {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  courses?: CourseType[];
};

export default function CourseListContainer({
  hasNextPage,
  fetchNextPage,
  isLoading,
  courses,
}: Props) {
  const deviceType = useResponsiveContext();
  const observer = useInfiniteScroll({ hasNextPage, fetchNextPage });

  const loader = courses && hasNextPage && (
    <div
      role="status"
      aria-live="polite"
      ref={observer}
      className="flex h-32 w-full items-center justify-center"
    >
      <SpinSangSangBoogi className="w-12" />
    </div>
  );

  // 밑의 calc 식은 courseFilters의 전체 높이(패딩, 마진, 높이 포함)를 뺀 계산식임
  // 데스크탑 기준 높이 64px, space-y-8(16px) = 80px
  // 모바일 기준 높이 104px, space-y-8(16px) = 120px
  if (deviceType === "desktop") {
    // 데스크톱은 표 안에서 헤더를 뺀 본문만 스크롤하므로 여기서는 스크롤하지 않는다
    return (
      <div className="h-[calc(100%-80px)] w-full">
        <CourseListForDesktop
          isLoading={isLoading}
          courses={courses}
          footer={loader}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "h-[calc(100%-80px)] w-full overflow-y-auto",
        "max-md:h-[calc(100%-40px)]",
      )}
    >
      <CourseListForMobile isLoading={isLoading} courses={courses} />
      {loader}
    </div>
  );
}
