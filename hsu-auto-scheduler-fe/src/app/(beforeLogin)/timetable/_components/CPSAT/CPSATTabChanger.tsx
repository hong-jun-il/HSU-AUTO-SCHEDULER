"use client";

import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";

type Props = {
  tabMode: "timetableMode" | "summaryMode";
  setTabMode: Dispatch<SetStateAction<"timetableMode" | "summaryMode">>;
  onlineCourseCount: number;
};

export default function CPSATTabChanger({ tabMode, setTabMode }: Props) {
  const handleTabMode = (tabMode: "timetableMode" | "summaryMode") => {
    setTabMode(tabMode);
  };

  return (
    <nav className="absolute top-0 right-0 flex -translate-y-full bg-transparent text-xs">
      <button
        className={clsx(
          "rounded-t-lg p-5 transition-colors duration-200",
          tabMode === "timetableMode"
            ? "bg-course-finder-main-bg"
            : "bg-[#807f7e] text-zinc-800",
        )}
        onClick={() => handleTabMode("timetableMode")}
      >
        시간표 보기
      </button>
      <button
        className={clsx(
          "rounded-t-lg p-5 transition-colors duration-200",
          tabMode === "summaryMode"
            ? "bg-course-finder-main-bg"
            : "bg-[#807f7e] text-zinc-800",
        )}
        onClick={() => handleTabMode("summaryMode")}
      >
        시간표 요약
      </button>
    </nav>
  );
}
