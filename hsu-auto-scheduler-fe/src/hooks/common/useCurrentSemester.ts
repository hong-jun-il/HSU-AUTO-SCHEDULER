import { DEFAULT_SEMESTER } from "@/constants/semester.const";
import { useSearchParams } from "next/navigation";

export default function useCurrentSemester() {
  const params = useSearchParams();
  const semester = params.get("semester");

  return semester ?? DEFAULT_SEMESTER;
}
