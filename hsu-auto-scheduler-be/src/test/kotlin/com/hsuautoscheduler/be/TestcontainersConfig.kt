package com.hsuautoscheduler.be

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.postgresql.PostgreSQLContainer

/** 테스트는 실제 PostgreSQL(운영과 같은 버전)로만 돌린다. 접속 정보는 @ServiceConnection 이 datasource 에 넣는다 */
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfig {
	@Bean
	@ServiceConnection
	fun postgres(): PostgreSQLContainer = PostgreSQLContainer("postgres:17-alpine")
}
