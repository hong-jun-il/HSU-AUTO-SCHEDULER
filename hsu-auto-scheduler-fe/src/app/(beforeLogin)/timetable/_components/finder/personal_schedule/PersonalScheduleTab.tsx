"use client";

import clsx from "clsx";
import { useShallow } from "zustand/shallow";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import useCurrentSemester from "@/hooks/common/useCurrentSemester";
import usePersonalScheduleModal from "@/hooks/CourseFinder/PersonalSchedule/usePersonalScheduleModal";
import PersonalScheduleCard from "./PersonalScheduleCard";
import PersonalScheduleAddCard from "./PersonalScheduleAddCard";

export default function PersonalScheduleTab() {
  const currentSemester = useCurrentSemester();

  const { personalSchedulesInCurSemester } = useTimetableStore(
    useShallow((state) => ({
      personalSchedulesInCurSemester: state.personalSchedules[currentSemester],
    })),
  );

  const { handleAddPersonalSchedule } = usePersonalScheduleModal();

  return (
    <div className="flex h-full w-full flex-col gap-15 overflow-y-auto bg-white p-5">
      <div className="text-hsu flex items-center justify-between border-b pb-10 font-bold">
        <h2 className="max-sm:text-md text-xl max-md:text-lg">
          개인 스케줄 관리
        </h2>
        <button
          className={clsx(
            "rounded-xl px-10 py-5 font-semibold text-white",
            "max-sm:text-xxs text-sm max-md:text-xs",
            "transition-all duration-300",
            "hover:shadow-hsu/40 hover:-translate-y-2 hover:shadow-lg",
          )}
          style={{
            background: "linear-gradient(135deg, #2e5cb8 0%, #4472c4 100%)",
          }}
          onClick={handleAddPersonalSchedule}
        >
          개인 스케줄 추가
        </button>
      </div>
      <ul className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
        {personalSchedulesInCurSemester.map((personalSchedule, i) => (
          <PersonalScheduleCard
            key={personalSchedule.id}
            personalSchedule={personalSchedule}
            index={i}
          />
        ))}
        <PersonalScheduleAddCard />
      </ul>
    </div>
  );
}
