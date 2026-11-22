package com.hsuautoscheduler.api.common

import java.time.OffsetDateTime

/**
 * 사용자 API(/api/...) 응답. 기존 Nest API 와 같은 모양이라 프론트의 ResponseType 을 그대로 쓴다.
 * 스크래퍼용 /admin API 는 감싸지 않는다.
 */
data class ApiResponse<T>(
	val success: Boolean,
	val message: String,
	val data: T?,
) {
	companion object {
		fun <T> ok(data: T, message: String = "요청이 성공적으로 처리되었습니다") = ApiResponse(true, message, data)
	}
}

data class ApiErrorResponse(
	val success: Boolean = false,
	val message: String,
	/** HTTP 상태 이름 (BAD_REQUEST, NOT_FOUND …) */
	val error: String,
	val path: String,
	val timestamp: OffsetDateTime = OffsetDateTime.now(),
)
