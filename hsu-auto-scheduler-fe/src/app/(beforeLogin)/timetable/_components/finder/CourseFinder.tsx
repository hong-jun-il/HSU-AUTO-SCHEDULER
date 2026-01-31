"use client";

import DropDownArrow from "@/assets/icons/DropDownArrow";
import { useShallow } from "zustand/shallow";
import { motion } from "framer-motion";
import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useState } from "react";
import clsx from "clsx";
import CourseFinderTabChanger from "./CourseFinderTabChanger";
import CourseTab from "./CourseTab";
import PersonalScheduleTab from "./personal_schedule/PersonalScheduleTab";

export default function CourseFinder() {
  const { isOpen, setClose, courseFinderHeight } = useTimetableStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setClose: state.setClose,
      courseFinderHeight: state.courseFinderHeight,
    })),
  );

  const [editMode, setEditMode] = useState<"course" | "schedule">("course");

  return (
    <motion.div
      animate={{
        height: isOpen ? `${courseFinderHeight}dvh` : "0dvh",
        opacity: isOpen ? 1 : 0,
      }}
      initial={{ height: 0, opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={clsx(
        "fixed bottom-0 z-(--z-index-course-finder) w-full bg-white px-5 py-7",
        "border-t-border border-t-course-finder-border border-t",
      )}
    >
      <CourseFinderTabChanger editMode={editMode} setEditMode={setEditMode} />
      <button
        onClick={setClose}
        className="border-course-finder-border absolute top-0 right-0 translate-y-[-98%] rounded-t-lg border border-b-0 bg-white p-5"
      >
        <DropDownArrow />
      </button>
      {editMode === "course" ? <CourseTab /> : <PersonalScheduleTab />}
    </motion.div>
  );
}
