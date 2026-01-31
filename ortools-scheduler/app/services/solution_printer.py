from app.schemas.common.course_schema import CourseSchema
from app.schemas.common.solution_schema import SolutionSchema
from app.schemas.common.enums import WeekdayEnum
from app.utils.group_courses_by_day import group_courses_by_day


class AllSolutionPrinter:
    def __init__(self, solutions: list[CourseSchema]):
        self.solutions: list[SolutionSchema] = solutions

    def solution_print(self):
        for solution in self.solutions:
            solution_index = solution.solution_index
            selected_courses = solution.selected_courses
            total_credit = solution.total_credit
            total_course_gap = solution.total_course_gap
            total_online_course_count = solution.total_online_course_count

            # 요일별로 묶기
            courses_by_day = group_courses_by_day(selected_courses)

            print(
                f"{solution_index}번째 해 - 총 학점: {total_credit} total_course_gap: {total_course_gap} 온라인 강의 총 개수: {total_online_course_count}"
            )
            for day in courses_by_day:
                print(f"{WeekdayEnum(day).value}: ")
                for course_in_cur_day in courses_by_day[day]:
                    cur_course_name = course_in_cur_day.name
                    cur_course_requirement_types = "/".join(
                        course_in_cur_day.requirement_types
                    )
                    cur_course_delivery_method = course_in_cur_day.delivery_method
                    cur_course_credit = course_in_cur_day.credit
                    cur_course_offline_schedules = course_in_cur_day.offline_schedules
                    print(
                        f"{cur_course_name}({cur_course_requirement_types}, {cur_course_delivery_method}, {cur_course_credit}학점)",
                        end=" ",
                    )

                    for offline_schedule in cur_course_offline_schedules:
                        place = offline_schedule.place
                        start_time_hour = offline_schedule.start_time // 60
                        start_time_min = offline_schedule.start_time % 60
                        end_time_hour = offline_schedule.end_time // 60
                        end_time_min = offline_schedule.end_time % 60

                        print(
                            f"{place}, {start_time_hour:02d}:{start_time_min:02d}~{end_time_hour:02d}:{end_time_min:02d}"
                        )
            print()
            print()
