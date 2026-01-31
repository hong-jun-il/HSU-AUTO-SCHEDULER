"use client";

import useGetCPSATResults from "@/hooks/queries/useGetCPSATResults";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCPSATResultStore } from "@/store/CPSATResult/CPSATResultStore";
import { useShallow } from "zustand/shallow";
import clsx from "clsx";
import { CPSATFilterType } from "@/types/schemas/filter.schema";
import CPSATResultModal from "../../../CPSAT/CPSATResultModal";

type Props = {
  hasEnoughData: boolean;
};

export default function FetchCPSATResult({ hasEnoughData }: Props) {
  const { CPSATResultModalIsOpen, setCPSATResultModalOpen } =
    useCPSATResultStore(
      useShallow((state) => ({
        CPSATResultModalIsOpen: state.CPSATResultModalIsOpen,
        setCPSATResultModalOpen: state.setCPSATResultModalOpen,
      })),
    );
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { handleSubmit, getValues } = useFormContext<CPSATFilterType>();
  const { refetch } = useGetCPSATResults();
  const filters = getValues();

  const confirmInsufficientCredit = () => {
    return confirm(
      `${filters.max_credit}학점을 조합하기에는 충분한 강의가 있지 않습니다. 계속하시겠습니까?`,
    );
  };

  const onSubmit = async () => {
    if (!hasEnoughData && !confirmInsufficientCredit()) return;

    setCPSATResultModalOpen();
    setIsFetching(true);
    const start = Date.now();

    await refetch();

    const elapsed = Date.now() - start;
    const minTime = 700;
    setTimeout(
      () => setIsFetching(false),
      Math.max(minTime, minTime - elapsed),
    );
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
      {CPSATResultModalIsOpen && <CPSATResultModal isFetching={isFetching} />}
    </>
  );
}
