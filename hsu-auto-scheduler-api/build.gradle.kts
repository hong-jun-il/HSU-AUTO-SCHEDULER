plugins {
	kotlin("jvm") version "2.3.21"
	// @Component·@Transactional 등이 붙은 클래스를 open 으로 만든다 (Spring 프록시용)
	kotlin("plugin.spring") version "2.3.21"
	// @Entity 에 no-arg 생성자를 만든다 (Hibernate 가 인스턴스를 만들 때 필요)
	kotlin("plugin.jpa") version "2.3.21"
	id("org.springframework.boot") version "4.1.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.hsuautoscheduler"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	// 조회는 JPA, 학기 저장(대량 upsert)은 JdbcTemplate 으로 한다
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	// 스키마는 Flyway SQL(src/main/resources/db/migration)이 만든다.
	// Spring Boot 4 는 자동설정이 모듈로 나뉘어서 flyway-core 만으로는 기동 시 마이그레이션이 돌지 않는다
	implementation("org.springframework.boot:spring-boot-starter-flyway")
	implementation("tools.jackson.module:jackson-module-kotlin")
	// 학기 조회 데이터·시간표 추천 결과의 메모리 캐시 (버전은 Spring Boot BOM 이 정한다)
	implementation("com.github.ben-manes.caffeine:caffeine")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	runtimeOnly("org.flywaydb:flyway-database-postgresql")
	runtimeOnly("org.postgresql:postgresql")

	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	testImplementation("org.springframework.boot:spring-boot-testcontainers")
	// Testcontainers 2.x 부터 아티팩트 이름에 testcontainers- 접두사가 붙는다
	testImplementation("org.testcontainers:testcontainers-postgresql")
	testImplementation("org.testcontainers:testcontainers-junit-jupiter")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll(
			"-Xjsr305=strict",
			"-Xannotation-default-target=param-property",
			// List<@Valid T> 처럼 타입 인자에 붙인 어노테이션을 바이트코드에 남긴다 (없으면 리스트 안 검증이 조용히 꺼진다)
			"-Xemit-jvm-type-annotations",
		)
	}
}

// 지연 로딩 프록시를 만들 수 있게 엔티티를 open 으로 만든다
allOpen {
	annotation("jakarta.persistence.Entity")
	annotation("jakarta.persistence.MappedSuperclass")
	annotation("jakarta.persistence.Embeddable")
}

// 배포 산출물은 bootJar 하나만 만든다
tasks.jar {
	enabled = false
}

tasks.withType<Test> {
	useJUnitPlatform()
	systemProperty("admin.token", "test-admin-token")
}
