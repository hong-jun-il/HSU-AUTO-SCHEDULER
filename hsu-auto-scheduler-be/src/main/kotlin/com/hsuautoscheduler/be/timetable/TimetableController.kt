package com.hsuautoscheduler.be.timetable

import com.hsuautoscheduler.be.common.ApiResponse
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** 사용자 조회 API. 응답은 기존 Nest 와 같은 { success, message, data } 로 감싼다 */
@RestController
@RequestMapping("/api/semesters")
class TimetableController(
	private val lectures: LectureSearchService,
	private val timetables: TimetableRecommendService,
) {
	@GetMapping
	fun semesters() = lectures.semesters().let { ApiResponse.ok(it, "학기 ${it.size}개 조회") }

	@GetMapping("/{semesterId}/majors")
	fun majors(@PathVariable semesterId: String) =
		lectures.majors(semesterId).let { ApiResponse.ok(it, "전공 ${it.size}개 조회") }

	/** 필터가 많고 개인 일정 등 구조가 있어서 POST 로 받는다 */
	@PostMapping("/{semesterId}/lectures/search")
	fun searchLectures(@PathVariable semesterId: String, @Valid @RequestBody req: LectureSearchRequest) =
		lectures.search(semesterId, req).let { ApiResponse.ok(it, "강의 ${it.totalCount}개 중 ${it.courses.size}개 조회") }

	@PostMapping("/{semesterId}/timetables")
	fun recommendTimetables(@PathVariable semesterId: String, @Valid @RequestBody req: TimetableRequest) =
		timetables.recommend(semesterId, req).let { ApiResponse.ok(it, "시간표 조합 ${it.totalSolutionCount}개") }
}
