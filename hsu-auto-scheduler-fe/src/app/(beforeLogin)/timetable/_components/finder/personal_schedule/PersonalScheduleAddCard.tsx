"use client";

import Plus from "@/assets/icons/Plus";
import usePersonalScheduleModal from "@/hooks/CourseFinder/PersonalSchedule/usePersonalScheduleModal";
import clsx from "clsx";

export default function PersonalScheduleAddCard() {
  const { handleAddPersonalSchedule } = usePersonalScheduleModal();
  return (
    <button
      className={clsx(
        "flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#c8d4ff]",
        "bg-linear-[135deg,var(--color-light-hsu)_0%,#fff_100%]",
        "hover:border-deep-hsu hover:shadow-hsu/20 min-h-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg",
      )}
      onClick={handleAddPersonalSchedule}
    >
      <div className="bg-deep-hsu flex aspect-square w-18 items-center justify-center rounded-full text-xl text-white">
        <Plus className="w-6" />
      </div>
      <div className="text-hsu text-sm font-semibold">새 스케줄 추가</div>
    </button>
  );
}
