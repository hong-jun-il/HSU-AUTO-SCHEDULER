import { DAYS } from "@/constants/days.const";
import { WeekdayKorMap } from "@/enums/weekday.enum";
import clsx from "clsx";

type Props = {
  isCPSATResult: boolean;
};

export default function TimetableHead({ isCPSATResult }: Props) {
  return (
    <table
      className={clsx(
        "sticky top-0",
        "bg-timetable-body-bg z-[9997] w-full",
        "text-sm",
        isCPSATResult ? "max-md:text-xxs" : "max-md:text-xs",
      )}
    >
      <colgroup>
        <col
          className={clsx(
            "border-timetable-cell-border border",
            "w-30",
            isCPSATResult ? "max-md:w-20" : "max-md:w-25",
          )}
        />
        {DAYS.map((day) => (
          <col key={day} className="border-timetable-cell-border border" />
        ))}
      </colgroup>

      <thead className="text-hsu">
        <tr className={clsx(isCPSATResult ? "h-16 max-md:h-12" : "h-25")}>
          <th />
          {DAYS.map((day) => (
            <th key={day}>{WeekdayKorMap[day]}</th>
          ))}
        </tr>
      </thead>
    </table>
  );
}
