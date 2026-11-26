import { useTimetableStore } from "@/store/timetable/timetableStore";
import { skipToken, useInfiniteQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { useShallow } from "zustand/shallow";
import useCurrentSemester from "../common/useCurrentSemester";
import { useEffect } from "react";
import { CPSATSolutionType } from "@/types/CPSATSolution.type";
import { ResponseType } from "@/types/response.type";
import { CPSAT_RESULT_PER_PAGE } from "@/constants/pagination.const";
import { CPSATFilterType } from "@/types/schemas/filter.schema";
import { useCPSATResultStore } from "@/store/CPSATResult/CPSATResultStore";
import { CPSATRequestType } from "@/store/CPSATResult/CPSATRequest.slice";

type CPSATResultPageType = ResponseType<{
  // 서버가 돌려주는 해의 개수(상위 최대 50개)
  total_solution_count: number;
  solutions: CPSATSolutionType[];
}>;

// 조건이 같으면 추천 결과도 같으므로(솔버 결과는 같은 입력에 같은 순서) 10분 동안 다시 요청하지 않는다
const CPSAT_RESULT_STALE_TIME = 10 * 60 * 1000;

async function fetchCPSATResultPage(
  request: CPSATRequestType,
  page: number,
): Promise<CPSATResultPageType> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/schedule/get-cpsat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPage: page,
        pagePerLimit: CPSAT_RESULT_PER_PAGE,
        ...request,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("CP-SAT Result HTTP ERROR!");
  }

  return response.json();
}

export default function useGetCPSATResults() {
  const currentSemester = useCurrentSemester();

  const { selectedCourses, personalSchedules } = useTimetableStore(
    useShallow((state) => ({
      selectedCourses: state.selectedCourses,
      personalSchedules: state.personalSchedules,
    })),
  );

  // "시간표 자동 생성"을 누른 순간의 조건. 누르기 전에는 null 이라 쿼리가 실행되지 않는다
  const submittedCPSATRequest = useCPSATResultStore(
    (state) => state.submittedCPSATRequest,
  );

  const { setValue } = useFormContext<CPSATFilterType>();

  // rhf의 selected_courses와 zustand의 selectedCourses는 여기서 동기화됨
  // personal_schedules도 마찬가지
  useEffect(() => {
    setValue("selected_courses", selectedCourses[currentSemester] ?? []);
  }, [currentSemester, selectedCourses, setValue]);

  useEffect(() => {
    setValue("personal_schedules", personalSchedules[currentSemester] ?? []);
  }, [currentSemester, personalSchedules, setValue]);

  return useInfiniteQuery({
    // 누른 조건 자체가 키라서, 조건이 바뀌면 새로 요청하고 같으면 캐시를 쓴다
    queryKey: ["cp-sat result", submittedCPSATRequest],
    queryFn: submittedCPSATRequest
      ? ({ pageParam }) =>
          fetchCPSATResultPage(submittedCPSATRequest, pageParam)
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // 받은 해가 서버가 돌려줄 수 있는 개수(total_solution_count)에 닿으면 끝
      // 마지막 페이지가 꽉 차 있어도(예: 50개) 빈 다음 페이지를 요청하지 않는다
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.data.solutions.length,
        0,
      );

      if (
        lastPage.data.solutions.length === 0 ||
        loadedCount >= lastPage.data.total_solution_count
      ) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    staleTime: CPSAT_RESULT_STALE_TIME,
    // 다른 조건으로 바꿨다가 돌아와도 쓸 수 있게, 화면에서 안 쓰는 동안에도 같은 시간만큼 남겨 둔다
    gcTime: CPSAT_RESULT_STALE_TIME,
  });
}
