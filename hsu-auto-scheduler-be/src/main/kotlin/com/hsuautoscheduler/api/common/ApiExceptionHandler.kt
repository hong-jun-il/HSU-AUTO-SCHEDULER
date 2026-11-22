package com.hsuautoscheduler.api.common

import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.resource.NoResourceFoundException

/** 모든 오류를 같은 모양(ApiErrorResponse)으로 돌려준다. 컨트롤러 안의 @ExceptionHandler 가 있으면 그쪽이 먼저다 */
@RestControllerAdvice
class ApiExceptionHandler {
	private val log = LoggerFactory.getLogger(javaClass)

	@ExceptionHandler(MethodArgumentNotValidException::class)
	fun invalid(e: MethodArgumentNotValidException, req: HttpServletRequest) =
		error(HttpStatus.BAD_REQUEST, e.bindingResult.fieldErrors.joinToString(", ") { "${it.field}: ${it.defaultMessage}" }, req)

	@ExceptionHandler(HttpMessageNotReadableException::class)
	fun unreadable(e: HttpMessageNotReadableException, req: HttpServletRequest) =
		error(HttpStatus.BAD_REQUEST, "요청 본문을 읽을 수 없습니다: ${e.mostSpecificCause.message?.lineSequence()?.first()}", req)

	@ExceptionHandler(ResponseStatusException::class)
	fun status(e: ResponseStatusException, req: HttpServletRequest) =
		error(HttpStatus.valueOf(e.statusCode.value()), e.reason ?: "요청을 처리할 수 없습니다", req)

	@ExceptionHandler(NoResourceFoundException::class)
	fun notFound(e: NoResourceFoundException, req: HttpServletRequest) =
		error(HttpStatus.NOT_FOUND, "없는 경로입니다", req)

	@ExceptionHandler(Exception::class)
	fun unexpected(e: Exception, req: HttpServletRequest): ResponseEntity<ApiErrorResponse> {
		log.error("[{}] {} 처리 중 오류", req.method, req.requestURI, e)
		return error(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다", req)
	}

	private fun error(status: HttpStatus, message: String, req: HttpServletRequest) =
		ResponseEntity.status(status).body(ApiErrorResponse(message = message, error = status.name, path = req.requestURI))
}
