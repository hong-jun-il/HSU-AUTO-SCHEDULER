package com.hsuautoscheduler.api.timetable

import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.Weekday
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull

/** 강의 조회 요청: 공통 필터 + 검색어 */
data class LectureSearchRequest(
	@field:Min(1)
	val page: Int = 1,
	@field:Min(1) @field:Max(100)
	val size: Int = 20,
	val majorId: String? = null,
	val search: String? = null,
	@field:Min(1) @field:Max(4)
	val grade: Int? = null,
	val dayOrNight: DayOrNight? = null,
	val noClassDays: List<Weekday> = emptyList(),
	val hasLunchBreak: Boolean = false,
	val selectedLectureIds: List<String> = emptyList(),
	val personalSchedules: List<@Valid PersonalScheduleRequest> = emptyList(),
)

/** 시간표 추천 요청: 공통 필터 + 제약조건. 전공·학년·주야는 필수 */
data class TimetableRequest(
	@field:Min(1)
	val page: Int = 1,
	@field:Min(1) @field:Max(100)
	val size: Int = 10,
	@field:NotNull
	val majorId: String?,
	@field:NotNull @field:Min(1) @field:Max(4)
	val grade: Int?,
	@field:NotNull
	val dayOrNight: DayOrNight?,
	val noClassDays: List<Weekday> = emptyList(),
	val hasLunchBreak: Boolean = false,
	val selectedLectureIds: List<String> = emptyList(),
	val personalSchedules: List<@Valid PersonalScheduleRequest> = emptyList(),
	@field:Valid @field:NotNull
	val constraints: ConstraintsRequest?,
)

/** 프론트의 개인 일정 (id·이름·장소는 필터에 쓰지 않는다) */
data class PersonalScheduleRequest(
	val id: String? = null,
	val personalScheduleName: String? = null,
	val offlineSchedules: List<@Valid PersonalTimeRequest> = emptyList(),
)

data class PersonalTimeRequest(
	val day: Weekday,
	@field:Min(0) @field:Max(1440)
	val startTime: Int,
	@field:Min(0) @field:Max(1440)
	val endTime: Int,
)

/** OR-Tools 로 그대로 넘기는 제약조건 */
data class ConstraintsRequest(
	@field:Min(0) @field:Max(30)
	val maxCredit: Int,
	@field:Min(0)
	val majorBasic: Int,
	@field:Min(0)
	val majorRequired: Int,
	@field:Min(0)
	val majorElective: Int,
	@field:Min(1)
	val dailyLectureLimit: Int,
)
