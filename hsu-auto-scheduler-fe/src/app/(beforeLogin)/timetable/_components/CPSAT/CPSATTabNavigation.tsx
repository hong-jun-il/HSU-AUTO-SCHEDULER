"use client";

import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";

type Props = {
  tabMode: "timetableMode" | "summaryMode";
  setTabMode: Dispatch<SetStateAction<"timetableMode" | "summaryMode">>;
};

export default function CPSATTabNavigation({ tabMode, setTabMode }: Props) {
  return (
    <div className={clsx("bg-light-hsu flex")}>
      <button
        className={clsx(
          "flex-1 py-4",
          "text-base font-bold max-md:text-xs",
          "text-course-info-text-base-gray",
          "border-border-hsu border-b-2",
          "transition-all duration-300",
          tabMode === "timetableMode" && "border-b-hsu text-hsu bg-white",
          tabMode !== "timetableMode" && "hover:bg-hsu/10",
        )}
        onClick={() => setTabMode("timetableMode")}
      >
        📅 시간표
      </button>
      <button
        className={clsx(
          "flex-1 py-4",
          "text-base font-bold max-md:text-xs",
          "text-course-info-text-base-gray",
          "border-border-hsu border-b-2",
          "transition-all duration-300",
          tabMode === "summaryMode" && "border-b-hsu text-hsu bg-white",
          tabMode !== "summaryMode" && "hover:bg-hsu/10",
        )}
        onClick={() => setTabMode("summaryMode")}
      >
        📊 종합 요약
      </button>
    </div>
  );
}
