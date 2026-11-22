import { WeekdayEnum } from "./enums/weekday.enum";

// 오프라인 수업 한 번 (시각은 자정부터의 분)
export type TimePlaceDBType = {
  day: WeekdayEnum;
  start_time: number;
  end_time: number;
  place: string;
};
