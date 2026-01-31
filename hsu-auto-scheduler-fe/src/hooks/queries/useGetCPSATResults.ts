import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { useShallow } from "zustand/shallow";
import useCurrentSemester from "../common/useCurrentSemester";
import { useEffect } from "react";
import { CPSATSolutionType } from "@/types/CPSATSolution.type";
import { ResponseType } from "@/types/response.type";
import { CPSAT_RESULT_PER_PAGE } from "@/constants/pagination.const";
import { CPSATFilterType } from "@/types/schemas/filter.schema";

export default function useGetCPSATResults() {
  const currentSemester = useCurrentSemester();

  const { selectedCourses, personalSchedules } = useTimetableStore(
    useShallow((state) => ({
      selectedCourses: state.selectedCourses,
      personalSchedules: state.personalSchedules,
    })),
  );

  const { setValue, getValues } = useFormContext<CPSATFilterType>();
  const values = getValues();

  // rhf의 selected_courses와 zustand의 selectedCourses는 여기서 동기화됨
  // personal_schedules도 마찬가지
  useEffect(() => {
    setValue("selected_courses", selectedCourses[currentSemester] ?? []);
  }, [currentSemester, selectedCourses, setValue]);

  useEffect(() => {
    setValue("personal_schedules", personalSchedules[currentSemester] ?? []);
  }, [currentSemester, personalSchedules, setValue]);

  return useInfiniteQuery({
    queryKey: ["cp-sat result"],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<
      ResponseType<{
        total_solution_count: number;
        solutions: CPSATSolutionType[];
      }>
    > => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/schedule/get-cpsat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPage: pageParam,
            pagePerLimit: CPSAT_RESULT_PER_PAGE,
            filters: {
              semester_id: values.semester_id,
              major_id: values.major_id,
              grade: values.grade,
              day_or_night: values.day_or_night,
              no_class_days: values.no_class_days,
              has_lunch_break: values.has_lunch_break,
              personal_schedules: values.personal_schedules,
              selected_courses: values.selected_courses,
            },
            constraints: {
              max_credit: values.max_credit,
              major_basic: values.major_basic,
              major_required: values.major_required,
              major_elective: values.major_elective,
              daily_lecture_limit: values.daily_lecture_limit,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("CP-SAT Result HTTP ERROR!");
      }

      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.data.solutions.length < CPSAT_RESULT_PER_PAGE) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    enabled: false,
  });
}
