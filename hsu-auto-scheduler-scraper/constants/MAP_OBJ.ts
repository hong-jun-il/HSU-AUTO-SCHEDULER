import { DayOrNightEnum } from "../type/enums/day_or_night.enum";
import { DeliveryMethodEnum } from "../type/enums/delivery_method.enum";
import { RequirementTypeEnum } from "../type/enums/requirement_type.enum";

export const REQUIREMENT_TYPE_MAP = {
  전필: RequirementTypeEnum.MAJOR_REQUIRED,
  전선: RequirementTypeEnum.MAJOR_ELECTIVE,
  전기: RequirementTypeEnum.MAJOR_BASIC,
  교필: RequirementTypeEnum.GENERAL_REQUIRED,
  선필교: RequirementTypeEnum.REQUIRED_GENERAL_ELECTIVE,
  일교: RequirementTypeEnum.GENERAL_ELECTIVE,
  일선: RequirementTypeEnum.FREE_ELECTIVE,
  MD전선: RequirementTypeEnum.MD_MAJOR_ELECTIVE,
  복전선: RequirementTypeEnum.DOUBLE_MAJOR_ELECTIVE,
};

export const DELIVERY_METHOD_MAP = {
  BL: DeliveryMethodEnum.BLENDED,
  "온라인100%": DeliveryMethodEnum.ONLINE,
  대면수업: DeliveryMethodEnum.FACE_TO_FACE,
};

// 종정시 juya 값
export const JUYA_MAP = {
  주: DayOrNightEnum.DAY,
  야: DayOrNightEnum.NIGHT,
  합: DayOrNightEnum.BOTH,
};

export const DAY_OR_NIGHT_MAP = {
  주야합반: DayOrNightEnum.BOTH,
  주간: DayOrNightEnum.DAY,
  야간: DayOrNightEnum.NIGHT,
};
