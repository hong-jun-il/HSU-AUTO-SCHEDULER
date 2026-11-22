import { WeekdayEnum } from "./enums/weekday.enum";

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
  day: WeekdayEnum;
  start_time: number;
  end_time: number;
  place: string;
};
