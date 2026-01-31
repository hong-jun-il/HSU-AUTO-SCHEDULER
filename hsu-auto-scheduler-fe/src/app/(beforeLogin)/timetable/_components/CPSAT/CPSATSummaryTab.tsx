"use client";

import { motion } from "framer-motion";
import { CPSATSolutionType } from "@/types/CPSATSolution.type";
import CPSATSummarySlideItem from "./CPSATSummarySlideItem";

type Props = {
  CPSATResult: CPSATSolutionType[];
  currentIndex: number;
};

export default function CPSATSummaryTab({ CPSATResult, currentIndex }: Props) {
  return (
    <div className="h-full overflow-x-hidden">
      <motion.div
        className="flex h-full w-full"
        initial={{
          translateX: `-${100 * currentIndex}%`,
        }}
        animate={{
          translateX: `-${currentIndex * 100}%`,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {CPSATResult.map((result) => (
          <CPSATSummarySlideItem key={result.solution_index} result={result} />
        ))}
      </motion.div>
    </div>
  );
}
