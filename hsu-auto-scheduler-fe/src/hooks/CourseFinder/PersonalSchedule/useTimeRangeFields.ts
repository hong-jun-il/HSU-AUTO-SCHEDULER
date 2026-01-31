import { PersonalScheduleType } from "@/types/schemas/personal_schedule.schema";
import { useFormContext } from "react-hook-form";

export default function useTimeRangeFields(index: number) {
  const { setValue, getValues } = useFormContext<PersonalScheduleType>();

  const handleStartTimeChange = (hour: number, min: number) => {
    const currentEndTime = getValues(`offline_schedules.${index}.end_time`);
    const newStartTime = hour * 60 + min;

    setValue(`offline_schedules.${index}.start_time`, newStartTime);

    /* 
      startTime이 endTime보다 크게 설정될 경우 endTime에 1시간을 더하되,
      오후 11시 55분보다 클 경우 오후 11시 55분으로 보정
    */
    if (newStartTime > currentEndTime) {
      setValue(
        `offline_schedules.${index}.end_time`,
        Math.min(newStartTime + 60, 23 * 60 + 55),
      );
    }
  };

  const handleEndTimeChange = (hour: number, min: number) => {
    const currentStartTime = getValues(`offline_schedules.${index}.start_time`);
    const newEndTime = hour * 60 + min;

    setValue(`offline_schedules.${index}.end_time`, newEndTime);

    /* 
      endTime이 startTime보다 작게 설정된 경우 startTime에 1시간을 빼되,
      오전 9시보다 작을 경우 오전 9시로 보정
    */
    if (newEndTime < currentStartTime) {
      setValue(
        `offline_schedules.${index}.start_time`,
        Math.max(newEndTime - 60, 9 * 60),
      );
    }
  };

  return { handleStartTimeChange, handleEndTimeChange };
}
