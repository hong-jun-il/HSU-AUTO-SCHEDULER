package com.hsuautoscheduler.be.ingest

import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.security.MessageDigest

/**
 * 스크래퍼 전용. 학기 하나를 통째로 교체한다.
 * `X-Admin-Token` 헤더가 설정값(admin.token)과 같아야 한다. 설정값이 비어 있으면 모든 요청을 거절한다.
 */
@RestController
@RequestMapping("/admin/semesters")
class SemesterIngestController(
	private val service: SemesterIngestService,
	@Value("\${admin.token:}") private val adminToken: String,
) {
	@PutMapping("/{semesterId}")
	fun replace(
		@PathVariable semesterId: String,
		@RequestHeader("X-Admin-Token", required = false) token: String?,
		@Valid @RequestBody request: SemesterIngestRequest,
	): IngestResult {
		if (adminToken.isBlank() || token == null ||
			!MessageDigest.isEqual(token.toByteArray(), adminToken.toByteArray())
		) {
			throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 토큰이 필요합니다")
		}
		if (semesterId != request.semesterId) {
			throw ResponseStatusException(
				HttpStatus.BAD_REQUEST,
				"경로의 학기($semesterId)와 본문의 학기(${request.semesterId})가 다릅니다",
			)
		}
		if (request.majors.isEmpty()) {
			// 빈 요청으로 학기 데이터를 통째로 지우는 사고를 막는다
			throw ResponseStatusException(HttpStatus.BAD_REQUEST, "전공이 하나도 없습니다")
		}
		return service.replace(request)
	}

	@ExceptionHandler(IngestConflictException::class)
	fun conflict(e: IngestConflictException): ResponseEntity<Map<String, Any>> =
		ResponseEntity.unprocessableContent().body(mapOf("message" to "데이터 충돌로 저장하지 않았습니다", "conflicts" to e.conflicts))
}
