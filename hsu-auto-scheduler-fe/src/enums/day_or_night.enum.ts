export enum DayOrNightEnum {
  DAY = "DAY",
  NIGHT = "NIGHT",
  BOTH = "BOTH",
}

export const DayOrNightKorMap: Record<DayOrNightEnum, string> = {
  [DayOrNightEnum.DAY]: "주간",
  [DayOrNightEnum.NIGHT]: "야간",
  [DayOrNightEnum.BOTH]: "합반",
};
