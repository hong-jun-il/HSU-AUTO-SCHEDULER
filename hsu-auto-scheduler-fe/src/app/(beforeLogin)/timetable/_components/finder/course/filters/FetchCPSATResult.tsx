"use client";

import useGetCPSATResults from "@/hooks/queries/useGetCPSATResults";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCPSATResultStore } from "@/store/CPSATResult/CPSATResultStore";
import { buildCPSATRequest } from "@/store/CPSATResult/CPSATRequest.slice";
import { useShallow } from "zustand/shallow";
import clsx from "clsx";
import { CPSATFilterType } from "@/types/schemas/filter.schema";
import CPSATResultModal from "../../../CPSAT/CPSATResultModal";

type Props = {
  hasEnoughData: boolean;
};

// 실제로 요청할 때 로딩 화면이 깜빡이지 않도록 최소한 보여주는 시간
const MIN_LOADER_MS = 700;

export default function FetchCPSATResult({ hasEnoughData }: Props) {
  const {
    CPSATResultModalIsOpen,
    setCPSATResultModalOpen,
    submitCPSATRequest,
  } = useCPSATResultStore(
    useShallow((state) => ({
      CPSATResultModalIsOpen: state.CPSATResultModalIsOpen,
      setCPSATResultModalOpen: state.setCPSATResultModalOpen,
      submitCPSATRequest: state.submitCPSATRequest,
    })),
  );

  const { handleSubmit, getValues } = useFormContext<CPSATFilterType>();
  // 캐시가 없는 조건을 처음 요청할 때만 true. 같은 조건을 다시 누르면 캐시를 바로 보여준다
  const { isLoading } = useGetCPSATResults();

  const [isHoldingLoader, setIsHoldingLoader] = useState<boolean>(false);
  const loaderTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) return;

    setIsHoldingLoader(true);
    window.clearTimeout(loaderTimerRef.current);
    loaderTimerRef.current = window.setTimeout(
      () => setIsHoldingLoader(false),
      MIN_LOADER_MS,
    );
  }, [isLoading]);

  useEffect(() => {
    return () => window.clearTimeout(loaderTimerRef.current);
  }, []);

  const confirmInsufficientCredit = () => {
    return confirm(
      `${getValues().max_credit}학점을 조합하기에는 충분한 강의가 있지 않습니다. 계속하시겠습니까?`,
    );
  };

  const onSubmit = () => {
    if (!hasEnoughData && !confirmInsufficientCredit()) return;

    // 누른 순간의 조건을 쿼리 키로 넘긴다. 조건이 바뀌었으면 요청하고, 같으면 캐시를 쓴다
    submitCPSATRequest(buildCPSATRequest(getValues()));
    setCPSATResultModalOpen();
  };

  return (
    <>
      <button
        className={clsx(
          "bg-hsu text-white",
          "h-full px-3",
          "text-xs whitespace-nowrap",
          "rounded-lg",
          "max-md:flex-2/3",
        )}
        onClick={handleSubmit(onSubmit)}
      >
        시간표 자동 생성
      </button>
      {CPSATResultModalIsOpen && (
        <CPSATResultModal isFetching={isLoading || isHoldingLoader} />
      )}
    </>
  );
}
