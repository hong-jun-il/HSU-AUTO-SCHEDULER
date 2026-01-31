"use client";

import { useTimetableStore } from "@/store/timetable/timetableStore";
import { useShallow } from "zustand/shallow";
import { AnimatePresence, motion } from "framer-motion";

export default function TimeTableEditButton() {
  const { isOpen, setOpen } = useTimetableStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setOpen: state.setOpen,
    })),
  );

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          key="timetable-button"
          className="create-timetable-btn max-md:text-md fixed right-[7dvw] z-[99999] px-8 py-5 text-lg max-sm:text-sm"
          initial={{ bottom: "-500px", opacity: 0 }}
          animate={{ bottom: "50px", opacity: 1 }}
          exit={{ bottom: "-500px", opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          onClick={setOpen}
        >
          시간표 생성
        </motion.button>
      )}
    </AnimatePresence>
  );
}
