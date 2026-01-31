from pydantic import BaseModel, Field
from app.schemas.common.enums import WeekdayEnum


class OfflineScheduleSchema(BaseModel):
    id: str = Field(..., description="오프라인 스케줄 ID")
    day: WeekdayEnum = Field(..., description="요일")
    start_time: int = Field(..., description="시작 시간")
    end_time: int = Field(..., description="종료 시간")
    place: str = Field(..., description="장소")
