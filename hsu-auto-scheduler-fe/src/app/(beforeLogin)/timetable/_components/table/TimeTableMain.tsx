import TimeTableBody from "./TimetableBody";
import TimeTableTitle from "./TimetableTitle";

export default function TimeTableMain() {
  return (
    <div className="h-fit w-full max-w-1000 min-w-150 md:px-10">
      <TimeTableTitle />
      <TimeTableBody />
    </div>
  );
}
