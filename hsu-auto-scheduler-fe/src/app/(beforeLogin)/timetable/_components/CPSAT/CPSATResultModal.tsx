"use client";

import Portal from "@/components/Portal";
import useCPSATDataProcess from "@/hooks/CPSAT/useCPSATDataProcess";
import clsx from "clsx";
import CloseIcon from "@/assets/icons/CloseIcon";
import { useShallow } from "zustand/shallow";
import { useCPSATResultStore } from "@/store/CPSATResult/CPSATResultStore";
import CPSATResultsPanel from "../CPSAT/CPSATResultsPanel";
import FetchingLoader from "./FetchingLoader";

type Props = {
  isFetching: boolean;
};

export default function CPSATResultModal({ isFetching }: Props) {
  const { setCPSATResultModalClose } = useCPSATResultStore(
    useShallow((state) => ({
      setCPSATResultModalClose: state.setCPSATResultModalClose,
    })),
  );
  const { totalSolutionCount, CPSATResult } = useCPSATDataProcess();

  return (
    <Portal>
      {isFetching ? (
        <FetchingLoader />
      ) : (
        <div
          className={clsx(
            "fixed top-0 left-0 z-(--z-index-CPSATResult-modal)",
            "flex justify-center",
            "h-dvh w-full overflow-y-hidden",
            "bg-black/70",
            "py-10",
          )}
        >
          {CPSATResult.length > 0 ? (
            <CPSATResultsPanel
              CPSATResult={CPSATResult}
              totalSolutionCount={totalSolutionCount}
            />
          ) : (
            <div
              className={clsx(
                "flex flex-col items-center justify-center",
                "relative",
                "h-full w-full",
                "px-5",
              )}
            >
              <div
                className={clsx(
                  "absolute top-5 right-1/20",
                  "flex items-center justify-center",
                  "rounded-full border border-gray-300",
                  "aspect-square w-25",
                  "cursor-pointer",
                )}
                onClick={setCPSATResultModalClose}
              >
                <CloseIcon width={30} fill="oklch(87.2% 0.01 258.338)" />
              </div>
              <p className="mb-3 text-center text-xl text-gray-300">
                추천 시간표를 찾을 수 없습니다
              </p>
              <p className="text-center text-sm text-gray-300">
                너무 복잡하거나 데이터셋에서 조합할 수 없는 조건은 추천 시간표를
                계산하는데 어려움을 줄 수 있습니다
              </p>
            </div>
          )}
        </div>
      )}
    </Portal>
  );
}
