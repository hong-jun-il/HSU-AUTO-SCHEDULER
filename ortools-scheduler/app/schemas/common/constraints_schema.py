from pydantic import BaseModel, Field


class ConstraintsSchema(BaseModel):
    max_credit: int = Field(..., description="최대 학점")
    major_basic: int = Field(..., description="전공 기초 최소 학점")
    major_required: int = Field(..., description="전공 필수 최소 학점")
    major_elective: int = Field(..., description="전공 선택 최소 학점")
    daily_lecture_limit: int = Field(..., description="하루 최대 강의 제한")
