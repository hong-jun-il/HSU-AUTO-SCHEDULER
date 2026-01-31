"use client";

import { SelectedCoursesByDayType } from "@/types/course_timetable_render.type";
import OnlineCourseList from "../table/OnlineCourseList";
import TimeTableGrid from "../table/TimeTableGrid";
import { PersonalSchedulesByDayType } from "@/types/personalScheduleRender.type";

type Props = {
  selectedCoursesByDay: SelectedCoursesByDayType;
  personalSchdulesByDay?: PersonalSchedulesByDayType;
};

export default function CPSATTimetableSlideItem({
  selectedCoursesByDay,
  personalSchdulesByDay,
}: Props) {
  return (
    <div className="flex h-fit w-full shrink-0 flex-col gap-10">
      <TimeTableGrid
        selectedCoursesByDay={selectedCoursesByDay}
        personalSchedulesByDay={personalSchdulesByDay}
        isCPSATResult={true}
      />
      {selectedCoursesByDay && selectedCoursesByDay["nontimes"] && (
        <OnlineCourseList
          onlineCourses={selectedCoursesByDay["nontimes"]}
          isCPSATResult={true}
        />
      )}
    </div>
  );
}
