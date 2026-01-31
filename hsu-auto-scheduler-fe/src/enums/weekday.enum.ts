export enum WeekdayEnum {
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
  SUN = "SUN",
}

export const WeekdayKorMap: Record<WeekdayEnum, string> = {
  [WeekdayEnum.MON]: "월",
  [WeekdayEnum.TUE]: "화",
  [WeekdayEnum.WED]: "수",
  [WeekdayEnum.THU]: "목",
  [WeekdayEnum.FRI]: "금",
  [WeekdayEnum.SAT]: "토",
  [WeekdayEnum.SUN]: "일",
};

export const WeekdayOrder: Record<WeekdayEnum, number> = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};
