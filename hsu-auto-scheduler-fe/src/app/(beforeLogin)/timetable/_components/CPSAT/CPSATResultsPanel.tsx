"use client";

import { CPSATSolutionType } from "@/types/CPSATSolution.type";
import { useState } from "react";
import clsx from "clsx";
import useCPSATSlider from "@/hooks/CPSAT/useCPSATSlider";
import CPSATPaginationControls from "./CPSATPaginationControls ";
import CPSATTabHeader from "./CPSATTabHeader";
import CPSATTabRenderer from "./CPSATTabRenderer";

type Props = {
  CPSATResult: CPSATSolutionType[];
  totalSolutionCount: number;
};

export default function CPSATResultsPanel({
  CPSATResult,
  totalSolutionCount,
}: Props) {
  const [tabMode, setTabMode] = useState<"timetableMode" | "summaryMode">(
    "timetableMode",
  );

  const { currentIndex, onPrev, onNext } = useCPSATSlider(totalSolutionCount);

  return (
    <div
      className={clsx(
        "relative max-h-[95dvh] w-[75dvw] overflow-y-hidden",
        "max-md:w-[85dvw]",
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <CPSATPaginationControls
        currentIndex={currentIndex}
        totalSolutionCount={totalSolutionCount}
        onPrev={onPrev}
        onNext={onNext}
      />

      <CPSATTabHeader
        currentIndex={currentIndex}
        totalSolutionCount={totalSolutionCount}
        CPSATResult={CPSATResult}
      />

      <CPSATTabRenderer
        tabMode={tabMode}
        setTabMode={setTabMode}
        CPSATResult={CPSATResult}
        currentIndex={currentIndex}
      />
    </div>
  );
}
