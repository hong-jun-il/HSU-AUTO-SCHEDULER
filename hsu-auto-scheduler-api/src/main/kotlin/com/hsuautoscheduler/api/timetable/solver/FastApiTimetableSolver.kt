package com.hsuautoscheduler.api.timetable.solver

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.client.JdkClientHttpRequestFactory
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.server.ResponseStatusException
import tools.jackson.core.JacksonException
import tools.jackson.databind.ObjectMapper
import java.net.http.HttpClient
import java.time.Duration

/**
 * FastAPI(ortools-scheduler)의 POST /cp-sat 을 부른다.
 * 본문은 Spring 의 ObjectMapper(snake_case)로 직접 직렬화한다 — OR-Tools 쪽 스키마가 snake_case 다.
 */
@Component
class FastApiTimetableSolver(
	private val mapper: ObjectMapper,
	@Value("\${solver.base-url}") baseUrl: String,
	@Value("\${solver.timeout}") timeout: Duration,
) : TimetableSolver {
	private val client = RestClient.builder()
		.baseUrl(baseUrl)
		.requestFactory(
			JdkClientHttpRequestFactory(
				// http:// 에 HTTP/2 업그레이드를 시도하면 uvicorn 이 경고를 남긴다
				HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).connectTimeout(Duration.ofSeconds(2)).build(),
			)
				.apply { setReadTimeout(timeout) },
		)
		.build()

	override fun solve(request: SolverRequest): SolverResult {
		val body = try {
			client.post()
				.uri("/cp-sat")
				.contentType(MediaType.APPLICATION_JSON)
				.body(mapper.writeValueAsString(request))
				.retrieve()
				.body(String::class.java)
		} catch (e: RestClientException) {
			throw ResponseStatusException(HttpStatus.BAD_GATEWAY, "시간표 추천 서버 호출에 실패했습니다", e)
		}

		val response = try {
			mapper.readValue(body, FastApiResponse::class.java)
		} catch (e: JacksonException) {
			throw ResponseStatusException(HttpStatus.BAD_GATEWAY, "시간표 추천 서버 응답을 읽을 수 없습니다", e)
		}
		return SolverResult(
			totalSolutionCount = response.totalSolutionCount,
			solutions = response.solutions.map {
				StoredSolution(
					solutionIndex = it.solutionIndex,
					totalCredit = it.totalCredit,
					totalMajorBasicCredit = it.totalMajorBasicCredit,
					totalMajorRequiredCredit = it.totalMajorRequiredCredit,
					totalMajorElectiveCredit = it.totalMajorElectiveCredit,
					totalCourseGap = it.totalCourseGap,
					totalOfflineCourseCount = it.totalOfflineCourseCount,
					totalOnlineCourseCount = it.totalOnlineCourseCount,
					noClassDays = it.noClassDays,
					lectureIds = it.selectedCourses.map { course -> course.id.toLong() },
				)
			},
		)
	}

	private data class FastApiResponse(val totalSolutionCount: Int, val solutions: List<FastApiSolution>)

	private data class FastApiSolution(
		val solutionIndex: Int,
		val totalCredit: Int,
		val totalMajorBasicCredit: Int,
		val totalMajorRequiredCredit: Int,
		val totalMajorElectiveCredit: Int,
		val totalCourseGap: Int,
		val totalOfflineCourseCount: Int,
		val totalOnlineCourseCount: Int,
		val noClassDays: List<String> = emptyList(),
		val selectedCourses: List<SelectedCourse> = emptyList(),
	)

	private data class SelectedCourse(val id: String)
}
