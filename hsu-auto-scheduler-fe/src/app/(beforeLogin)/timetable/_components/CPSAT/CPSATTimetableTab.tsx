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
            // 보이는 슬라이드와 넘길 때 함께 보이는 앞뒤 한 장만 그린다
            // 나머지는 슬라이드 폭만 차지하는 빈 칸으로 두어 translateX 위치는 그대로 유지한다
            if (Math.abs(i - currentIndex) > 1) {
              return <div key={i} className="w-full shrink-0" />;
            }

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
