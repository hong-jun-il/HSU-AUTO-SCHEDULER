package com.hsuautoscheduler.api.timetable

import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.DeliveryMethod
import com.hsuautoscheduler.api.domain.RequirementType
import com.hsuautoscheduler.api.domain.Weekday
import com.hsuautoscheduler.api.timetable.catalog.CatalogLecture

/**
 * 분반 하나의 응답 모양. 프론트 courseSchema 와 OR-Tools CourseSchema 가 이 모양을 받는다 (기존 Nest 와 같다).
 * id 들은 문자열, online_hour 는 시간 단위다.
 */
data class LectureView(
	val id: String,
	val courseId: String,
	val code: String,
	val name: String,
	val credit: Int,
	val professors: String,
	val requirementTypes: List<RequirementType>,
	val deliveryMethod: DeliveryMethod,
	val dayOrNight: DayOrNight,
	val section: String,
	val grades: List<Int>,
	val gradeLimits: List<Int>,
	val onlineHour: Double,
	val planCode: String?,
	val remark: String?,
	val offlineSchedules: List<ScheduleView>,
)

data class ScheduleView(val id: String, val day: Weekday, val startTime: Int, val endTime: Int, val place: String)

/**
 * 이수구분·학년은 전공을 골랐으면 그 전공의 값, 안 골랐으면 그 학기 모든 전공의 값을 모은 것이다.
 * 고른 전공이 열지 않는 분반(시간표 추천의 미리 고른 강의 등)은 모든 전공의 값을 쓴다.
 * CP-SAT 은 requirement_types 로 전기·전필·전선 학점을 세므로, 추천에서는 고른 전공 기준이어야 한다.
 */
fun CatalogLecture.toView(majorId: Long?): LectureView {
	val forMajor = if (majorId == null) offerings else offerings.filter { it.majorId == majorId }
	val shown = forMajor.ifEmpty { offerings }
	return LectureView(
		id = id.toString(),
		courseId = courseId.toString(),
		code = code,
		name = name,
		credit = credit,
		professors = professors,
		requirementTypes = shown.map { it.requirementType }.distinct().sortedBy { it.ordinal },
		deliveryMethod = deliveryMethod,
		dayOrNight = dayOrNight,
		section = section,
		grades = shown.map { it.grade }.distinct().sorted(),
		gradeLimits = listOfNotNull(gradeLimit),
		onlineHour = onlineMinutes / 60.0,
		planCode = planCode,
		remark = remark,
		offlineSchedules = schedules.map { ScheduleView(it.id.toString(), it.day, it.startTime, it.endTime, it.place) },
	)
}
