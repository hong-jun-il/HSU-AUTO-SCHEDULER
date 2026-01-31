import { PersonalScheduleType } from "@/types/schemas/personal_schedule.schema";

// 개인 스케줄 이름과 장소의 모든 앞 뒤 공백을 제거하는 함수
export default function cleanPersonalSchedule(
  personalSchedule: PersonalScheduleType,
): PersonalScheduleType {
  const cleanedPersonalScheduleName =
    personalSchedule.personal_schedule_name.trim();

  const cleanedOfflineSchedules = personalSchedule.offline_schedules.map(
    (offlineSchedule) => {
      const trimmedPlace = offlineSchedule.place?.trim();

      if (!trimmedPlace) {
        return { ...offlineSchedule, place: "" };
      }

      return offlineSchedule;
    },
  );

  const cleanedPersonalSchedule: PersonalScheduleType = {
    ...personalSchedule,
    personal_schedule_name: cleanedPersonalScheduleName,
    offline_schedules: cleanedOfflineSchedules,
  };

  return cleanedPersonalSchedule;
}
