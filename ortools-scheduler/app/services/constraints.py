from collections import defaultdict
from app.schemas.common.course_schema import CourseSchema
from app.utils.get_start_time_and_end_time import get_start_time_and_end_time
from app.schemas.common.enums import RequirementTypeEnum


# ------- deprecated ------- #
# 목적함수를 사용하면 여러 해를 구할 수 없기 때문에 사용하지 않음
# 최대로 지향하는 목적 함수
# 목적 함수는 모델에서 하나만 사용 가능하다
def set_objective_maximize_credit(courses: list[CourseSchema], model, is_selected):
    # 최대 학점 지향하는 목적식
    # 이게 없다면 0학점도 나올 수 있음
    objective_max_credit = sum(
        cur * course.credit for cur, course in zip(is_selected, courses)
    )

    # 전공 기초 선택을 최소화하는 목적식
    # 전공 기초는 최소 사용자가 입력한 값 이상을 선택하기 때문에 최대를 제한하기 위해 가중치를 조절하여 최소한의 선택을 하도록 한다
    objective_minimize_major_foundation = sum(
        course.credit * cur
        for course, cur in zip(courses, is_selected)
        if "전기" in course.completion_types
    )

    # 전공 필수 선택을 최소화하는 목적식
    # 전공 필수 또한 전공 기초와 마찬가지로 입력한 값 이상을 선택하되, 최대를 제한하기 위해 가중치를 조절
    objective_minimize_major_required = sum(
        course.credit * cur
        for course, cur in zip(courses, is_selected)
        if "전필" in course.completion_types
    )

    # 전공 선택 선택을 최소화하는 목적식
    # 전공 선택 또한 전공 기초와 마찬가지로 입력한 값 이상을 선택하되, 최대를 제한하기 위해 가중치를 조절
    objective_minimize_major_elective = sum(
        course.credit * cur
        for course, cur in zip(courses, is_selected)
        if "전선" in course.completion_types
    )

    model.Maximize(
        objective_max_credit
        - objective_minimize_major_foundation * 0.5
        - objective_minimize_major_required * 0.5
        - objective_minimize_major_elective * 0.5
    )


# 미리 선택한 강의들을 해의 선택된 강의에 추가하는 제약조건 함수
def add_pre_selected_course_constraint(
    courses: list[CourseSchema],
    model,
    is_selected,
    pre_selected_courses: list[CourseSchema],
):
    pre_selected_courses_ids_set = set(
        [pre_selected_course.id for pre_selected_course in pre_selected_courses]
    )

    for idx, course in enumerate(courses):
        if course.id in pre_selected_courses_ids_set:
            model.Add(is_selected[idx] == 1)


# 최대 학점 제한하는 제약조건 추가 함수
def add_max_credit_constraint(
    courses: list[CourseSchema], model, is_selected, max_credit: int
):
    # 최대 학점 제한
    limit_max = (
        sum(course.credit * cur for course, cur in zip(courses, is_selected))
        <= max_credit
    )

    # 최소 학점 제한 최대 학점에서 6뺀 학점. 최대 학점이 6미만이라면 0으로 처리
    # 만약 데이터셋이 충분하지 않다면 해당 데이터셋을 합친 학점으로 최소 학점 처리
    # courses_total_credit = sum(course.credit for course in courses)
    # min_credit = max_credit

    # if courses_total_credit < max_credit:
    #     min_credit = 1 if courses_total_credit == 0 else courses_total_credit
    # else:
    #     min_credit = max(max_credit - 3, 1)
    #
    # limit_min = (
    #     sum(course.credit * cur for course, cur in zip(courses, is_selected))
    #     >= min_credit
    # )

    not_zero_credit = (
        sum(course.credit * cur for course, cur in zip(courses, is_selected)) > 0
    )

    model.Add(limit_max)
    model.Add(not_zero_credit)


# 과목의 코드를 기준으로 중복을 제거하는 제약조건 추가 함수
def add_deduplicated_course_constraint(courses: list[CourseSchema], model, is_selected):
    course_code_to_indices = defaultdict(list)

    # 동일한 과목들을 전체 배열에서 인덱스를 기준으로 각기 배열로 묶은 dict를 생성
    # 해당 배열들을 돌면서 is_selected 배열에서 그 배열의 is_selected의 합이 1이 넘지 않도록 제약조건 추가
    # [1, 2, 3, 4]로 묶였다면 is_selected에서 해당 인덱스들의 합은 반드시 1 이하여야 함
    for idx, course in enumerate(courses):
        course_code_to_indices[course.code].append(idx)

    for indices in course_code_to_indices.values():
        model.Add(sum(is_selected[i] for i in indices) <= 1)


# 사용자가 입력한 전공 기초 학점의 최솟값만큼 해에 전공 기초를 보장 제약조건 추가 함수
def add_major_basic_min_constraint(
    courses: list[CourseSchema], model, is_selected, major_basic_credit
):
    model.Add(
        sum(
            course.credit * cur
            for course, cur in zip(courses, is_selected)
            if RequirementTypeEnum.MAJOR_BASIC in course.requirement_types
        )
        >= major_basic_credit
    )


# 사용자가 입력한 전공 필수 학점의 최솟값만큼 해에 전공 필수를 보장 제약조건 추가 함수
def add_major_required_min_constraint(
    courses: list[CourseSchema], model, is_selected, major_required_credit
):
    model.Add(
        sum(
            course.credit * cur
            for course, cur in zip(courses, is_selected)
            if RequirementTypeEnum.MAJOR_REQUIRED in course.requirement_types
        )
        >= major_required_credit
    )


# 사용자가 입력한 전공 선택 학점의 최솟값만큼 해에 전공 선택를 보장 제약조건 추가 함수
def add_major_elective_min_constraint(
    courses: list[CourseSchema], model, is_selected, major_elective_credit
):
    model.Add(
        sum(
            course.credit * cur
            for course, cur in zip(courses, is_selected)
            if RequirementTypeEnum.MAJOR_ELECTIVE in course.requirement_types
        )
        >= major_elective_credit
    )


# 하루 최대 강의수를 제한하는 제약조건 추가 함수
def add_daily_lecture_limit_constraint(
    courses: list[CourseSchema], model, is_selected, daily_lecture_limit
):
    course_day_indices = defaultdict(list)

    for idx, course in enumerate(courses):
        if len(course.offline_schedules) > 0:
            for offline_schedule in course.offline_schedules:
                course_day_indices[offline_schedule.day].append(idx)

    for indices in course_day_indices.values():
        model.Add(sum(is_selected[i] for i in indices) <= daily_lecture_limit)
        # 이 밑에는 선택된 요일들에 최소 하나씩은 강의를 배치해야 한다는 조건임. 나중에 시간표가 이상하다면 주석 풀기
        # model.Add(sum(is_selected[i] for i in indices) >= 1)


# 강의 시간표 겹침을 방지하는 제약조건 추가 함수
def add_non_overlapping_schedule_constraint(
    courses: list[CourseSchema], model, is_selected
):
    course_day_indices = defaultdict(list)

    for cur_course_index, cur_course in enumerate(courses):
        for cur_course_offline_schedule in cur_course.offline_schedules:
            course_day_indices[cur_course_offline_schedule.day].append(cur_course_index)

    for cur_day in course_day_indices:
        indicies_by_day = course_day_indices[cur_day]
        for i, cur_course_index in enumerate(indicies_by_day):
            cur_course_start_time_in_cur_day, cur_course_end_time_in_cur_day = (
                get_start_time_and_end_time(courses[cur_course_index], cur_day)
            )

            for j in range(i + 1, len(indicies_by_day)):
                next_course_index = indicies_by_day[j]

                next_course = courses[next_course_index]
                next_course_start_time_in_cur_day, next_course_end_time_in_cur_day = (
                    get_start_time_and_end_time(next_course, cur_day)
                )

                # 강의 시간이 겹친다면 둘 중 하나는 해에 포함하지 않음
                if (
                    cur_course_start_time_in_cur_day < next_course_end_time_in_cur_day
                    and cur_course_end_time_in_cur_day
                    > next_course_start_time_in_cur_day
                ):
                    model.AddBoolOr(
                        is_selected[cur_course_index].Not(),
                        is_selected[next_course_index].Not(),
                    )
