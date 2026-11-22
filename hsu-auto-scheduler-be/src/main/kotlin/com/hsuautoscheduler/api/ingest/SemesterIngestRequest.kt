package com.hsuautoscheduler.api.ingest

import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.DeliveryMethod
import com.hsuautoscheduler.api.domain.RequirementType
import com.hsuautoscheduler.api.domain.Weekday
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.PositiveOrZero
import java.time.OffsetDateTime

/**
 * 스크래퍼가 보내는 학기 하나 전체. 스크래퍼의 `npm run send -- <학기> --dry-run` 결과(payload.json)와 같은 모양이다.
 *
 * 종정시처럼 전공마다 그 전공의 분반 목록을 담는다. 같은 분반이 여러 전공에 나오므로
 * 서버가 (과목코드, 분반) 기준으로 합치고, 전공마다 값이 다르면 저장하지 않는다.
 */
data class SemesterIngestRequest(
	@field:Min(2000) @field:Max(2100)
	val year: Int,

	@field:Min(1) @field:Max(4)
	val term: Int,

	/** 종정시 수집 시각 (수집 파일의 fetchedAt) */
	val scrapedAt: OffsetDateTime? = null,

	val majors: List<@Valid MajorPayload>,
) {
	val semesterId: String get() = "$year-$term"
}

data class MajorPayload(
	@field:NotBlank
	val code: String,

	@field:NotBlank
	val name: String,

	val courses: List<@Valid CoursePayload>,
)

/** 종정시 강의 한 줄 = 한 전공에서 본 분반 하나 */
data class CoursePayload(
	@field:NotBlank
	val code: String,

	@field:NotBlank
	val name: String,

	@field:Min(1)
	val credit: Int,

	// 전공마다 다른 값 → major_course
	val requirementType: RequirementType,

	@field:Min(0) @field:Max(4)
	val grade: Int,

	// 분반 값 → lecture
	@field:Min(1) @field:Max(4)
	val gradeLimit: Int? = null,

	@field:NotBlank
	val section: String,

	val deliveryMethod: DeliveryMethod,

	val dayOrNight: DayOrNight,

	@field:NotBlank
	val professors: String,

	/** 온라인강좌 시간 (1.5 = 1시간 30분). DB 에는 분으로 저장한다 */
	@field:PositiveOrZero
	val onlineHour: Double,

	val planCode: String? = null,

	val remark: String? = null,

	/** 종정시 classroom 원문 */
	val classroomRaw: String? = null,

	val offlineSchedules: List<@Valid SchedulePayload>,
)

data class SchedulePayload(
	val day: Weekday,

	@field:Min(0) @field:Max(1440)
	val startTime: Int,

	@field:Min(0) @field:Max(1440)
	val endTime: Int,

	@field:NotBlank
	val place: String,
)
