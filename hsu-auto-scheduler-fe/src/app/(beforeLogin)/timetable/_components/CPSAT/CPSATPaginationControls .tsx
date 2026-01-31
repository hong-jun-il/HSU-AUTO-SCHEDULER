"use client";

import ChevronRight from "@/assets/icons/chevron-right";

type Props = {
  currentIndex: number;
  totalSolutionCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function CPSATPaginationControls({
  currentIndex,
  totalSolutionCount,
  onPrev,
  onNext,
}: Props) {
  return (
    <>
      {/* 왼쪽 chevron */}
      {currentIndex !== 0 && (
        <div
          className="fixed top-1/2 left-[5dvw] z-[999999999] flex aspect-square w-25 -translate-y-1/2 rotate-y-180 cursor-pointer items-center justify-center rounded-full border-2 border-[#8b8a8a] bg-transparent"
          onClick={onPrev}
        >
          <ChevronRight fill="#a8a8a8" width={35} height={35} />
        </div>
      )}
      {/* 오른쪽 chevron */}
      {currentIndex !== totalSolutionCount - 1 && (
        <div
          className="fixed top-1/2 right-[5dvw] z-[999999999] flex aspect-square w-25 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-[#8b8a8a] bg-transparent"
          onClick={onNext}
        >
          <ChevronRight fill="#a8a8a8" width={35} height={35} />
        </div>
      )}
    </>
  );
}
