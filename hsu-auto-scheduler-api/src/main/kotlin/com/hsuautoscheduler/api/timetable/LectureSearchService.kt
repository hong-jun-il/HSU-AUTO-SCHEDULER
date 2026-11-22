package com.hsuautoscheduler.api.timetable

import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.MajorRepository
import com.hsuautoscheduler.api.domain.Semester
import com.hsuautoscheduler.api.domain.SemesterRepository
import com.hsuautoscheduler.api.domain.Weekday
import com.hsuautoscheduler.api.timetable.catalog.CatalogLecture
import com.hsuautoscheduler.api.timetable.catalog.SemesterCatalog
import com.hsuautoscheduler.api.timetable.catalog.SemesterCatalogCache
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.OffsetDateTime

@Service
class LectureSearchService(
	private val semesters: SemesterRepository,
	private val majors: MajorRepository,
	private val catalogs: SemesterCatalogCache,
) {
	@Transactional(readOnly = true)
	fun semesters(): List<SemesterView> = semesters.findAllByOrderByYearDescTermDesc().map { it.toView() }

	@Transactional(readOnly = true)
	fun majors(semesterId: String): List<MajorView> {
		if (!semesters.existsById(semesterId)) throw ResponseStatusException(HttpStatus.NOT_FOUND, "없는 학기입니다: $semesterId")
		return majors.findOfferedIn(semesterId).map { MajorView(it.id.toString(), it.code, it.name) }
	}

	fun search(semesterId: String, req: LectureSearchRequest): LecturePage {
		val catalog = catalogs.get(semesterId)
		val conditions = conditionsOf(
			catalog, req.majorId, req.grade, req.dayOrNight, req.noClassDays, req.hasLunchBreak,
			req.selectedLectureIds, req.personalSchedules,
		)
		val matched = LectureFilter.apply(catalog.lectures, conditions).filter { LectureFilter.matchesSearch(it, req.search) }
		val from = (req.page - 1) * req.size
		return LecturePage(
			courses = matched.drop(from).take(req.size).map { it.toView(conditions.majorId) },
			totalCount = matched.size,
			hasNext = from + req.size < matched.size,
		)
	}

	private fun Semester.toView() = SemesterView(id, year, term, scrapedAt)
}

/** 요청의 문자열 id 들을 catalog 기준으로 풀어서 공통 필터 조건을 만든다. 그 학기에 없는 분반 id 면 400 */
internal fun conditionsOf(
	catalog: SemesterCatalog,
	majorId: String?,
	grade: Int?,
	dayOrNight: DayOrNight?,
	noClassDays: List<Weekday>,
	hasLunchBreak: Boolean,
	selectedLectureIds: List<String>,
	personalSchedules: List<PersonalScheduleRequest>,
): LectureConditions {
	val selected: List<CatalogLecture> = selectedLectureIds.distinct().map { raw ->
		raw.toLongOrNull()?.let(catalog::lecture)
			?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${catalog.semesterId} 학기에 없는 분반입니다: $raw")
	}
	return LectureConditions(
		majorId = majorId?.takeIf { it.isNotBlank() }?.let {
			it.toLongOrNull() ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "major_id 가 숫자가 아닙니다: $it")
		},
		grade = grade,
		dayOrNight = dayOrNight,
		noClassDays = noClassDays.toSet(),
		hasLunchBreak = hasLunchBreak,
		selected = selected,
		busyTimes = personalSchedules.flatMap { ps -> ps.offlineSchedules.map { TimeBlock(it.day, it.startTime, it.endTime) } },
	)
}

data class SemesterView(val id: String, val year: Int, val term: Int, val scrapedAt: OffsetDateTime?)

data class MajorView(val id: String, val code: String, val name: String)

data class LecturePage(val courses: List<LectureView>, val totalCount: Int, val hasNext: Boolean)
