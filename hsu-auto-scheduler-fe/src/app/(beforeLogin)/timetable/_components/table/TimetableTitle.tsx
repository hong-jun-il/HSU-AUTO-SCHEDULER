import clsx from "clsx";
import RHFSelectSemester from "./RHFSelectSemester";
import { getSemesters } from "@/api/getSemesters";
import ResetTimetableBtn from "./ResetTimetableBtn";

export default async function TimeTableTitle() {
  const { data: semesters } = await getSemesters();

  return (
    <div className="bg-hsu flex h-26 items-center justify-between rounded-t-2xl px-10">
      <h2
        className={clsx(
          "inline-block w-fit text-2xl font-bold text-white max-sm:text-sm",
        )}
      >
        HSU Auto Scheduler
      </h2>
      <div className="flex items-center">
        <ResetTimetableBtn />
        <RHFSelectSemester semesters={semesters} />
      </div>
    </div>
  );
}
