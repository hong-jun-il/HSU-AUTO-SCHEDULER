from pydantic import BaseModel, Field, field_validator
from typing import Optional
from app.schemas.common.enums import (
    DayOrNightEnum,
    RequirementTypeEnum,
    DeliveryMethodEnum,
)
from app.schemas.common.offline_schedule_schema import OfflineScheduleSchema


class CourseSchema(BaseModel):
    id: str = Field(..., description="분반 ID")
    course_id: str = Field(..., description="강의 ID")
    code: str = Field(..., description="강의 코드")
    name: str = Field(..., description="강의 이름")
    credit: int = Field(..., description="학점", ge=0)
    professors: str = Field(..., description="교수 이름 리스트")

    requirement_types: list[RequirementTypeEnum] = Field(
        default_factory=list, description="이수 구분"
    )
    delivery_method: DeliveryMethodEnum = Field(..., description="수업 방식")
    day_or_night: DayOrNightEnum = Field(..., description="주간/야간 여부")
    section: str = Field(..., description="분반")
    grades: list[int] = Field(default_factory=list, description="학년")
    grade_limits: list[int] = Field(default_factory=list, description="학년 제한")
    online_hour: float = Field(0.0, description="온라인 수업 시간", ge=0)
    offline_schedules: list[OfflineScheduleSchema] = Field(
        default_factory=list, description="오프라인 시간표"
    )
    plan_code: Optional[str] = Field(None, description="계획서 코드")
    remark: Optional[str] = Field(None, description="비고 사항")

    @field_validator("online_hour", mode="before")
    @classmethod
    def parse_online_hour(cls, v):
        if isinstance(v, str):
            return float(v)
        return v
