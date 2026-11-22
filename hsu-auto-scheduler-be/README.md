# hsu-auto-scheduler-be

Kotlin + Spring Boot 백엔드 (NestJS 백엔드를 대체).

- Kotlin 2.3, Spring Boot 4.1, JDK 25, PostgreSQL 17
- 스키마: Flyway (`src/main/resources/db/migration`). 설계 문서는 [`sql/ddl_v3/schema.dbml`](../sql/ddl_v3/schema.dbml)
- 조회는 JPA + 메모리 캐시, 학기 저장(대량 upsert)은 JDBC

## 실행

```bash
# 루트에서 PostgreSQL 띄우기 (5432 가 이미 쓰이면 .env 에 DB_PORT 를 바꾼다)
docker compose -f docker-compose.dev.yml up -d

# 이 폴더에서 서버 실행 (기동 시 Flyway 가 테이블을 만든다)
ADMIN_TOKEN=<스크래퍼와 같은 값> ./gradlew bootRun
```

| 환경변수 | 기본값 | 설명 |
| --- | --- | --- |
| `DB_HOST` `DB_PORT` `DB_DATABASE` `DB_USERNAME` `DB_PASSWORD` | localhost, 5432, hsu_auto_scheduler, hsu, hsu | PostgreSQL |
| `PORT` | 5000 | 서버 포트 |
| `ADMIN_TOKEN` | (없음) | 학기 저장 API 토큰. 비어 있으면 저장 요청을 모두 거절한다 |
| `FAST_API_BASE_URL` | http://localhost:4113 | 시간표 추천 엔진(ortools-scheduler) |
| `CORS_ALLOWED_ORIGINS` | `*` | 프론트 도메인. 쉼표로 여러 개 |

## API

사용자 API 는 `{ success, message, data }` 로 감싸고, 필드는 snake_case 다.

| 메서드·경로 | 설명 |
| --- | --- |
| `GET /api/semesters` | 학기 목록 (최신순) |
| `GET /api/semesters/{학기}/majors` | 그 학기에 과목이 있는 전공 |
| `POST /api/semesters/{학기}/lectures/search` | 강의 조회. 전공·학년·주야·검색어·공강 요일·점심시간·고른 분반 id·개인 일정으로 거르고 과목코드·분반 순으로 페이지를 나눈다 |
| `POST /api/semesters/{학기}/timetables` | 시간표 추천. 같은 필터로 후보를 골라 OR-Tools 에 보낸다. 결과는 10분 캐시해서 다음 페이지는 다시 풀지 않는다 |
| `PUT /admin/semesters/{학기}` | 스크래퍼 전용. 학기 하나를 한 트랜잭션으로 통째로 교체한다 (`X-Admin-Token` 필요) |

## 테스트

```bash
./gradlew test
```

테스트는 Testcontainers 로 실제 PostgreSQL 을 띄운다. Docker 가 `/var/run/docker.sock` 이 아닌 곳에 있으면(OrbStack 등) `DOCKER_HOST` 를 지정한다.

```bash
DOCKER_HOST=unix://$HOME/.orbstack/run/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock ./gradlew test
```

`SemesterIngestRealDataTest` 는 스크래퍼의 `data/hsuinfo-2026-2.payload.json` 이 있을 때만 돈다 (`npm run send -- 2026-2 --dry-run` 으로 만든다).

## 패키지

| 패키지 | 역할 |
| --- | --- |
| `domain` | 엔티티·enum·리포지토리. 컬럼과 제약은 V1__init.sql 이 기준이다 |
| `ingest` | 학기 저장 `/admin/...`. 전공별 분반 목록을 합치고(`SemesterSnapshot`) 한 트랜잭션으로 교체한다 |
| `timetable` | 사용자 조회 `/api/...` |
| `timetable.catalog` | 학기 하나를 메모리에 올린 조회 모델과 캐시. 학기 저장이 커밋되면 그 학기만 비운다 |
| `timetable.solver` | OR-Tools(FastAPI) 호출 |
| `common` | 응답 형식, 오류 처리, CORS |

강의 조회와 시간표 추천은 같은 필터(`LectureFilter`)를 쓴다. 필터 규칙은 DB 없이 단위 테스트한다(`LectureFilterTest`).
