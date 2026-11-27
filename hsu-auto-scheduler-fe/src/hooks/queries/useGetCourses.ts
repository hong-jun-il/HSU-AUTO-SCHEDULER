import { ResponseType } from "@/types/response.type";
import { CourseType } from "@/types/schemas/course.schema";
import { CourseFilterType } from "@/types/schemas/filter.schema";
import { useQuery } from "@tanstack/react-query";

// 조건에 맞는 강의를 한 번에 전부 받는다.
// 한 학기 전체도 약 1,500개(gzip 약 60KB, 로컬 응답 약 40ms)라 페이지로 나누면
// 로딩 표시·스크롤바 튐·스크롤바로 건너뛴 자리가 비는 문제만 생긴다
export default function useGetCourses(filters: CourseFilterType) {
  return useQuery({
    queryKey: [
      "courses",
      filters.semester_id,
      filters.major_id,
      filters.search,
      filters.grade,
      filters.day_or_night,
      JSON.stringify(filters.no_class_days),
      filters.has_lunch_break,
      JSON.stringify(filters.selected_courses),
      JSON.stringify(filters.personal_schedules),
    ],
    queryFn: async (): Promise<
      ResponseType<{
        courses: CourseType[];
        totalCount: number;
      }>
    > => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/schedule/get-courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filters }),
        },
      );

      if (!res.ok) {
        throw new Error("Get Courses HTTP ERROR!");
      }

      return res.json();
    },
    select: (data) => data.data.courses,
  });
}
