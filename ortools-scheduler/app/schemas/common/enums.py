from enum import Enum


class DayOrNightEnum(str, Enum):
    DAY = "DAY"
    NIGHT = "NIGHT"
    BOTH = "BOTH"


class WeekdayEnum(str, Enum):
    MON = "MON"
    TUE = "TUE"
    WED = "WED"
    THU = "THU"
    FRI = "FRI"
    SAT = "SAT"
    SUN = "SUN"
    NONE = "NONTIMES"


class RequirementTypeEnum(str, Enum):
    MAJOR_REQUIRED = "MAJOR_REQUIRED"
    MAJOR_ELECTIVE = "MAJOR_ELECTIVE"
    MAJOR_BASIC = "MAJOR_BASIC"
    GENERAL_REQUIRED = "GENERAL_REQUIRED"
    REQUIRED_GENERAL_ELECTIVE = "REQUIRED_GENERAL_ELECTIVE"
    GENERAL_ELECTIVE = "GENERAL_ELECTIVE"
    FREE_ELECTIVE = "FREE_ELECTIVE"
    MD_MAJOR_ELECTIVE = "MD_MAJOR_ELECTIVE"


class DeliveryMethodEnum(str, Enum):
    FACE_TO_FACE = "FACE_TO_FACE"
    ONLINE = "ONLINE"
    BLENDED = "BLENDED"
