package com.hsuautoscheduler.be.common

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * 프론트(다른 도메인)가 브라우저에서 /api 를 부를 수 있게 한다. 기존 Nest 의 enableCors 와 같은 역할이다.
 * /admin 은 스크래퍼(서버 간 호출) 전용이라 열지 않는다.
 */
@Configuration
class WebConfig(
	@Value("\${cors.allowed-origins}") private val allowedOrigins: List<String>,
) : WebMvcConfigurer {
	override fun addCorsMappings(registry: CorsRegistry) {
		registry.addMapping("/api/**")
			.allowedOriginPatterns(*allowedOrigins.toTypedArray())
			.allowedMethods("GET", "POST")
			.allowedHeaders("Content-Type")
	}
}
