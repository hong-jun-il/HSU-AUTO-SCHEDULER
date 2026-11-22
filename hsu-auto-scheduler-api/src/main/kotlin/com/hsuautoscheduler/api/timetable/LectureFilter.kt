package com.hsuautoscheduler.api.timetable

import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.Weekday
import com.hsuautoscheduler.api.timetable.catalog.CatalogLecture

/** 강의 조회와 시간표 추천이 같이 쓰는 필터 조건 */
data class LectureConditions(
	val majorId: Long? = null,
	/** 1~4. 전학년(0) 과목은 항상 포함한다 */
	val grade: Int? = null,
	val dayOrNight: DayOrNight? = null,
	/** 이 요일에 수업이 하나라도 있는 분반은 뺀다 */
	val noClassDays: Set<Weekday> = emptySet(),
	val hasLunchBreak: Boolean = false,
	/** 이미 고른 분반. 같은 과목의 다른 분반과 시간이 겹치는 분반을 뺀다 */
	val selected: List<CatalogLecture> = emptyList(),
	/** 개인 일정. 시간이 겹치는 분반을 뺀다 */
	val busyTimes: List<TimeBlock> = emptyList(),
)

data class TimeBlock(val day: Weekday, val startTime: Int, val endTime: Int) {
	fun overlaps(day: Weekday, startTime: Int, endTime: Int) =
		this.day == day && this.startTime < endTime && startTime < this.endTime
}

/**
 * 필터 규칙을 한 곳에 둔다. DB 없이 분반 목록에 바로 적용하는 순수 함수다.
 * (기존 Nest 는 조인한 시간표 행에 조건을 걸어서, 공강 요일 필터가 분반을 빼지 않고 시간표만 잘라냈다)
 */
object LectureFilter {
	private val LUNCH = Weekday.entries.map { TimeBlock(it, 12 * 60, 13 * 60) }

	fun apply(lectures: List<CatalogLecture>, c: LectureConditions): List<CatalogLecture> {
		val selectedCourseIds = c.selected.map { it.courseId }.toSet()
		val blocked = c.busyTimes +
			c.selected.flatMap { l -> l.schedules.map { TimeBlock(it.day, it.startTime, it.endTime) } } +
			(if (c.hasLunchBreak) LUNCH else emptyList())

		return lectures.filter { l ->
			matchesMajorAndGrade(l, c.majorId, c.grade) &&
				(c.dayOrNight == null || l.dayOrNight == DayOrNight.BOTH || l.dayOrNight == c.dayOrNight) &&
				l.schedules.none { it.day in c.noClassDays } &&
				l.courseId !in selectedCourseIds &&
				l.schedules.none { s -> blocked.any { it.overlaps(s.day, s.startTime, s.endTime) } }
		}
	}

	/** 전공을 골랐으면 그 전공의 학년만 본다. 안 골랐으면 어느 전공이든 그 학년(또는 전학년)이면 된다 */
	private fun matchesMajorAndGrade(l: CatalogLecture, majorId: Long?, grade: Int?): Boolean {
		val offerings = if (majorId == null) l.offerings else l.offerings.filter { it.majorId == majorId }
		if (majorId != null && offerings.isEmpty()) return false
		return grade == null || offerings.any { it.grade == 0 || it.grade == grade }
	}

	/** 검색어: 과목코드·분반 과목명·교수 부분 일치 (대소문자 무시) */
	fun matchesSearch(l: CatalogLecture, search: String?): Boolean {
		val q = search?.trim().orEmpty()
		if (q.isEmpty()) return true
		return l.code.contains(q, ignoreCase = true) ||
			l.name.contains(q, ignoreCase = true) ||
			l.professors.contains(q, ignoreCase = true)
	}
}
