import { DayOrNightEnum } from "../type/dayOrNight.enum";

export default function parseDayOrNight(
  dayOrNightInKor: string
): DayOrNightEnum {
  switch (dayOrNightInKor) {
    case "주야합반":
      return DayOrNightEnum.BOTH;
    case "주간":
      return DayOrNightEnum.DAY;
    case "야간":
      return DayOrNightEnum.NIGHT;
  }
}
