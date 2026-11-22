import { COURSES_PER_PAGE } from "@/constants/pagination.const";
import { ResponseType } from "@/types/response.type";
import { CourseType } from "@/types/schemas/course.schema";
import { CourseFilterType } from "@/types/schemas/filter.schema";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useGetCourses(filters: CourseFilterType) {
  return useInfiniteQuery({
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
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<
      ResponseType<{
        courses: CourseType[];
        total_count: number;
        has_next: boolean;
      }>
    > => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/semesters/${filters.semester_id}/lectures/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: pageParam,
            size: COURSES_PER_PAGE,
            major_id: filters.major_id || null,
            search: filters.search || null,
            grade: filters.grade ? Number(filters.grade) : null,
            day_or_night: filters.day_or_night || null,
            no_class_days: filters.no_class_days,
            has_lunch_break: filters.has_lunch_break,
            // 고른 강의는 분반 id 만 보낸다. 강의 정보는 서버가 DB 에서 읽는다
            selected_lecture_ids: filters.selected_courses.map(
              (course) => course.id,
            ),
            personal_schedules: filters.personal_schedules,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Get Courses HTTP ERROR!");
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.data.has_next ? lastPageParam + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.data.courses),
      pageParams: data.pageParams,
    }),
  });
}
