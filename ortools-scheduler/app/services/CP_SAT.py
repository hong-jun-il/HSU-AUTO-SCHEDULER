from ortools.sat.python import cp_model
from app.schemas.common.course_schema import CourseSchema
from app.schemas.common.constraints_schema import ConstraintsSchema
from app.services.constraints import (
    add_pre_selected_course_constraint,
    add_max_credit_constraint,
    add_deduplicated_course_constraint,
    add_major_basic_min_constraint,
    add_major_required_min_constraint,
    add_major_elective_min_constraint,
    add_daily_lecture_limit_constraint,
    add_non_overlapping_schedule_constraint,
)
from app.services.solution_collector import AllSolutionCollector
from app.services.solution_printer import AllSolutionPrinter


def HSU_AUTO_SCHEDULER_CP_SAT(
    filtered_data: list[CourseSchema],
    pre_selected_courses: list[CourseSchema],
    constraints: ConstraintsSchema,
):
    data_len = len(filtered_data)

    model = cp_model.CpModel()

    is_selected = [model.NewBoolVar(f"course{i}_is_selected") for i in range(data_len)]

    # set_objective_maximize_credit(filtered_data, model, is_selected)
    add_pre_selected_course_constraint(
        filtered_data, model, is_selected, pre_selected_courses
    )
    add_max_credit_constraint(filtered_data, model, is_selected, constraints.max_credit)
    add_deduplicated_course_constraint(filtered_data, model, is_selected)
    add_major_basic_min_constraint(
        filtered_data, model, is_selected, constraints.major_basic
    )
    add_major_required_min_constraint(
        filtered_data, model, is_selected, constraints.major_required
    )
    add_major_elective_min_constraint(
        filtered_data, model, is_selected, constraints.major_elective
    )
    add_daily_lecture_limit_constraint(
        filtered_data, model, is_selected, constraints.daily_lecture_limit
    )
    add_non_overlapping_schedule_constraint(filtered_data, model, is_selected)

    solver = cp_model.CpSolver()
    solution_collector = AllSolutionCollector(is_selected, filtered_data)

    # Enumerate all solutions.
    solver.parameters.enumerate_all_solutions = True

    # 탐색 시간제한 5초
    solver.parameters.max_time_in_seconds = 5.0

    # Solve
    status = solver.solve(model, solution_collector)

    if status == cp_model.INFEASIBLE:
        print("해가 존재하지 않음")

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:

        # 해가 나왔다면 총 학점 높은 순으로,
        # 전학년 포함된 강의가 적은 순으로,
        # 온라인 강의 많은 순으로,
        # 수업 간 간격(분) 낮은 순으로 정렬
        solution_collector.sort_solutions_by_priority()

        # 이러면 정렬 이후에 찍힘
        # solution_printer = AllSolutionPrinter(solution_collector.get_solutions)
        # solution_printer.solution_print()

        print(
            f"총 해의 개수: {solution_collector.solution_count} 총 탐색 시간: {solver.WallTime()}초"
        )

    return {
        "total_solution_count": solution_collector.get_solution_count,
        "solutions": solution_collector.get_solutions,
    }
