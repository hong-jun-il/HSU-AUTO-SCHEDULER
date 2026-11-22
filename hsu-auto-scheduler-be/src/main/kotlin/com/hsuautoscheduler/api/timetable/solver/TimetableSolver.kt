package com.hsuautoscheduler.api.timetable.solver

import com.hsuautoscheduler.api.timetable.ConstraintsRequest
import com.hsuautoscheduler.api.timetable.LectureView

/** 시간표 조합을 푸는 쪽 (운영은 FastAPI + OR-Tools CP-SAT) */
interface TimetableSolver {
	fun solve(request: SolverRequest): SolverResult
}

/** OR-Tools CPSATRequestSchema 와 같은 모양 */
data class SolverRequest(
	val filteredData: List<LectureView>,
	val preSelectedCourses: List<LectureView>,
	val constraints: ConstraintsRequest,
)

/** 풀이 결과. 강의 정보는 빼고 분반 id 만 남겨서 캐시를 작게 유지한다 */
data class SolverResult(val totalSolutionCount: Int, val solutions: List<StoredSolution>) {
	companion object {
		val EMPTY = SolverResult(0, emptyList())
	}
}

data class StoredSolution(
	val solutionIndex: Int,
	val totalCredit: Int,
	val totalMajorBasicCredit: Int,
	val totalMajorRequiredCredit: Int,
	val totalMajorElectiveCredit: Int,
	val totalCourseGap: Int,
	val totalOfflineCourseCount: Int,
	val totalOnlineCourseCount: Int,
	val noClassDays: List<String>,
	val lectureIds: List<Long>,
)
