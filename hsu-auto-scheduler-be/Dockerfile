# 1단계: 빌드 (Gradle wrapper 로 bootJar 를 만든다)
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# 빌드 설정만 먼저 복사해서 의존성 다운로드를 캐시한다 (소스만 바뀌면 이 층을 다시 쓰지 않는다)
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
RUN ./gradlew dependencies --no-daemon -q > /dev/null

COPY src src
# 테스트는 Testcontainers(Docker)가 필요해서 이미지 빌드에서는 돌리지 않는다
RUN ./gradlew bootJar --no-daemon -x test

# 2단계: 실행 (JRE 만)
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# 한 서버에 PostgreSQL·OR-Tools 와 같이 뜨므로 힙을 제한한다. compose 의 environment 로 바꿀 수 있다
ENV JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m"
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
