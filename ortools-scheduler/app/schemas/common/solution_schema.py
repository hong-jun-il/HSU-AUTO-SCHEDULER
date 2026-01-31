from pydantic import BaseModel, Field
from app.schemas.common.course_schema import CourseSchema


class SolutionSchema(BaseModel):
    solution_index: int = Field(..., description="CPSAT 결과 순서")
    total_credit: int = Field(..., description="전체 학점")
    total_major_basic_credit: int = Field(..., description="전기 학점")
    total_major_required_credit: int = Field(..., description="전필 학점")
    total_major_elective_credit: int = Field(..., description="전선 학점")
    total_course_gap: int = Field(..., description="전체 공강 시간 간격")
    total_offline_course_count: int = Field(..., description="오프라인 강의 개수")
    total_online_course_count: int = Field(..., description="온라인 강의 개수")
    no_class_days: list[str] = Field(default_factory=list, description="공강 요일들")
    selected_courses: list[CourseSchema] = Field(
        default_factory=list, description="CPSAT 결과로 선택된 강의들"
    )
