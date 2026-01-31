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
          body: JSON.stringify(
            {
              currentPage: pageParam,
              pagePerLimit: COURSES_PER_PAGE,
              filters,
            },
            null,
            0,
          ),
        },
      );

      if (!res.ok) {
        throw new Error("Get Courses HTTP ERROR!");
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.data.totalCount < COURSES_PER_PAGE
        ? undefined
        : lastPageParam + 1;
    },
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.data.courses),
      pageParams: data.pageParams,
    }),
  });
}
