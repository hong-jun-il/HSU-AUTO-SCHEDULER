import { WeekdayEnum } from "./weekday.enum";

export type TimePlaceXMLType = {
  "@_day": string;
  "@_start": string;
  "@_end": string;
  "@_place": string;
};

export type TimePlaceFileType = {
  day: number;
  start: number;
  end: number;
  place: string;
};

export type TimePlaceDBType = {
  offline_schedule_id: string;
  day: WeekdayEnum;
  start_time: number;
  end_time: number;
  place: string;
};
