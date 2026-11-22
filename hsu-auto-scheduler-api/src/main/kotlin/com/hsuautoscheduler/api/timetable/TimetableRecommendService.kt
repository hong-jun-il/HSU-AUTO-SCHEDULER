package com.hsuautoscheduler.api.timetable

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.hsuautoscheduler.api.timetable.catalog.SemesterCatalog
import com.hsuautoscheduler.api.timetable.catalog.SemesterCatalogCache
import com.hsuautoscheduler.api.timetable.solver.SolverRequest
import com.hsuautoscheduler.api.timetable.solver.SolverResult
import com.hsuautoscheduler.api.timetable.solver.TimetableSolver
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import java.security.MessageDigest
import java.time.Duration

/**
 * 시간표 추천. 강의 조회와 같은 필터(LectureFilter)로 후보를 고르고 솔버에 넘긴다.
 *
 * 솔버 결과는 요청 내용으로 만든 키로 10분 캐시한다. 프론트가 페이지 번호만 바꿔 같은 요청을 다시 보내므로,
 * 2페이지부터는 다시 풀지 않는다. 키에 학기 데이터를 읽은 시각이 들어가서 학기를 다시 저장하면 새로 푼다.
 */
@Service
class TimetableRecommendService(
	private val catalogs: SemesterCatalogCache,
	private val solver: TimetableSolver,
	private val mapper: ObjectMapper,
) {
	private val results: Cache<String, SolverResult> = Caffeine.newBuilder()
		.maximumSize(200)
		.expireAfterWrite(Duration.ofMinutes(10))
		.build()

	fun recommend(semesterId: String, req: TimetableRequest): SolutionPage {
		val catalog = catalogs.get(semesterId)
		val conditions = conditionsOf(
			catalog, req.majorId, req.grade, req.dayOrNight, req.noClassDays, req.hasLunchBreak,
			req.selectedLectureIds, req.personalSchedules,
		)
		val constraints = req.constraints!!
		val key = cacheKey(catalog, conditions, constraints)
		// 같은 키가 동시에 오면 두 번 풀 수 있지만, Caffeine 의 compute 안에서 5초짜리 호출로 다른 키를 막는 것보다 낫다
		val result = results.getIfPresent(key) ?: solve(catalog, conditions, constraints).also { results.put(key, it) }

		val from = (req.page - 1) * req.size
		return SolutionPage(
			totalSolutionCount = result.totalSolutionCount,
			solutions = result.solutions.drop(from).take(req.size).map { s ->
				SolutionView(
					solutionIndex = s.solutionIndex,
					totalCredit = s.totalCredit,
					totalMajorBasicCredit = s.totalMajorBasicCredit,
					totalMajorRequiredCredit = s.totalMajorRequiredCredit,
					totalMajorElectiveCredit = s.totalMajorElectiveCredit,
					totalCourseGap = s.totalCourseGap,
					totalOfflineCourseCount = s.totalOfflineCourseCount,
					totalOnlineCourseCount = s.totalOnlineCourseCount,
					noClassDays = s.noClassDays,
					selectedCourses = s.lectureIds.mapNotNull { catalog.lecture(it)?.toView(conditions.majorId) },
				)
			},
		)
	}

	private fun solve(catalog: SemesterCatalog, conditions: LectureConditions, constraints: ConstraintsRequest): SolverResult {
		val candidates = LectureFilter.apply(catalog.lectures, conditions)
		if (candidates.isEmpty() && conditions.selected.isEmpty()) return SolverResult.EMPTY

		// 기존 Nest 와 같이 미리 고른 강의는 후보에도 넣고 pre_selected 로도 보낸다 (OR-Tools 가 반드시 포함시킨다)
		val selected = conditions.selected.map { it.toView(conditions.majorId) }
		return solver.solve(
			SolverRequest(
				filteredData = selected + candidates.map { it.toView(conditions.majorId) },
				preSelectedCourses = selected,
				constraints = constraints,
			),
		)
	}

	private fun cacheKey(catalog: SemesterCatalog, c: LectureConditions, constraints: ConstraintsRequest): String {
		val normalized = mapOf(
			"semester" to catalog.semesterId,
			"loaded_at" to catalog.loadedAt.toString(),
			"major" to c.majorId,
			"grade" to c.grade,
			"day_or_night" to c.dayOrNight,
			"no_class_days" to c.noClassDays.sortedBy { it.ordinal },
			"lunch" to c.hasLunchBreak,
			"selected" to c.selected.map { it.id }.sorted(),
			"busy" to c.busyTimes.sortedWith(compareBy({ it.day.ordinal }, { it.startTime }, { it.endTime })),
			"constraints" to constraints,
		)
		val digest = MessageDigest.getInstance("SHA-256").digest(mapper.writeValueAsBytes(normalized))
		return digest.joinToString("") { "%02x".format(it) }
	}
}

data class SolutionPage(val totalSolutionCount: Int, val solutions: List<SolutionView>)

/** 프론트 CPSATSolutionType 과 같은 모양 */
data class SolutionView(
	val solutionIndex: Int,
	val totalCredit: Int,
	val totalMajorBasicCredit: Int,
	val totalMajorRequiredCredit: Int,
	val totalMajorElectiveCredit: Int,
	val totalCourseGap: Int,
	val totalOfflineCourseCount: Int,
	val totalOnlineCourseCount: Int,
	val noClassDays: List<String>,
	val selectedCourses: List<LectureView>,
)
