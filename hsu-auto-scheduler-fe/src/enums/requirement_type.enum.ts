export enum RequirementTypeEnum {
  MAJOR_REQUIRED = "MAJOR_REQUIRED",
  MAJOR_ELECTIVE = "MAJOR_ELECTIVE",
  MAJOR_BASIC = "MAJOR_BASIC",
  GENERAL_REQUIRED = "GENERAL_REQUIRED",
  REQUIRED_GENERAL_ELECTIVE = "REQUIRED_GENERAL_ELECTIVE",
  GENERAL_ELECTIVE = "GENERAL_ELECTIVE",
  FREE_ELECTIVE = "FREE_ELECTIVE",
  MD_MAJOR_ELECTIVE = "MD_MAJOR_ELECTIVE",
}

export const RequirementTypeKorMap: Record<RequirementTypeEnum, string> = {
  [RequirementTypeEnum.MAJOR_REQUIRED]: "전필",
  [RequirementTypeEnum.MAJOR_ELECTIVE]: "전선",
  [RequirementTypeEnum.MAJOR_BASIC]: "전기",
  [RequirementTypeEnum.GENERAL_REQUIRED]: "교필",
  [RequirementTypeEnum.REQUIRED_GENERAL_ELECTIVE]: "선필교",
  [RequirementTypeEnum.GENERAL_ELECTIVE]: "일교",
  [RequirementTypeEnum.FREE_ELECTIVE]: "일선",
  [RequirementTypeEnum.MD_MAJOR_ELECTIVE]: "MD전선",
};
