import { useState } from "react";
import useGetCPSATResults from "../queries/useGetCPSATResults";
import { CPSAT_RESULT_PER_PAGE } from "@/constants/pagination.const";

export default function useCPSATSlider(totalSolutionCount: number) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const { fetchNextPage, hasNextPage } = useGetCPSATResults();

  const onPrev = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);
  };

  const onNext = () => {
    if (currentIndex === totalSolutionCount - 1) {
      return;
    }

    const currentPage = currentIndex % CPSAT_RESULT_PER_PAGE;

    // 현재 페이지의 마지막 바로 이전 아이템일때 fetch
    if (hasNextPage && currentPage === CPSAT_RESULT_PER_PAGE - 2) {
      fetchNextPage();
    }

    setCurrentIndex((prev) => prev + 1);
  };

  return {
    currentIndex,
    onPrev,
    onNext,
  };
}
