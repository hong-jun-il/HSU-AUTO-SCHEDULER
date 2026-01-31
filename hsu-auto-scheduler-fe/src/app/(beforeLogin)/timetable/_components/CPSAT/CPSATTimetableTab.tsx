import { SelectedCoursesByDayType } from "@/types/course_timetable_render.type";
import { PersonalSchedulesByDayType } from "@/types/personalScheduleRender.type";
import { motion } from "framer-motion";
import TimetableHead from "../table/TimetableHead";
import CPSATTimetableSlideItem from "./CPSATTimetableSlideItem";

type Props = {
  selectedCoursesByDayList: SelectedCoursesByDayType[];
  personalSchdulesByDay?: PersonalSchedulesByDayType;
  currentIndex: number;
};

export default function CPSATTimetableTab({
  selectedCoursesByDayList,
  personalSchdulesByDay,
  currentIndex,
}: Props) {
  return (
    <>
      <TimetableHead isCPSATResult />
      <div className="flex overflow-x-hidden">
        <motion.div
          className="flex w-full"
          initial={{
            translateX: `-${currentIndex * 100}%`,
          }}
          animate={{
            translateX: `-${currentIndex * 100}%`,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {selectedCoursesByDayList.map((selectedCoursesByDay, i) => {
            return (
              <CPSATTimetableSlideItem
                key={i}
                selectedCoursesByDay={selectedCoursesByDay}
                personalSchdulesByDay={personalSchdulesByDay}
              />
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
