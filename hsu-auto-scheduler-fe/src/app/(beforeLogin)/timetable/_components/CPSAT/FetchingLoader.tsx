import LoadingSpinner from "@/components/ui/Loading-spinner";
import React from "react";

export default function FetchingLoader() {
  return (
    <div className="fixed top-0 left-0 z-(--z-index-CPSATResult-modal) flex h-dvh w-dvw flex-col items-center justify-center gap-2 bg-black/70 text-lg text-gray-300">
      <LoadingSpinner />
      <span>시간표를 불러오는중입니다</span>
    </div>
  );
}
