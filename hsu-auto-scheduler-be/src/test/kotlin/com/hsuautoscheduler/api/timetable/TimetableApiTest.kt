package com.hsuautoscheduler.api.timetable

import com.hsuautoscheduler.api.TestcontainersConfig
import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.DeliveryMethod
import com.hsuautoscheduler.api.domain.RequirementType
import com.hsuautoscheduler.api.domain.Weekday
import com.hsuautoscheduler.api.ingest.CoursePayload
import com.hsuautoscheduler.api.ingest.MajorPayload
import com.hsuautoscheduler.api.ingest.SchedulePayload
import com.hsuautoscheduler.api.ingest.SemesterIngestRequest
import com.hsuautoscheduler.api.ingest.SemesterIngestService
import com.hsuautoscheduler.api.timetable.solver.SolverRequest
import com.hsuautoscheduler.api.timetable.solver.SolverResult
import com.hsuautoscheduler.api.timetable.solver.StoredSolution
import com.hsuautoscheduler.api.timetable.solver.TimetableSolver
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers.contains
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.context.annotation.Primary
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActionsDsl
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.options
import org.springframework.test.web.servlet.post
import org.springframework.web.server.ResponseStatusException
import java.time.OffsetDateTime

/**
 * 작은 학기 하나를 저장해 두고 조회 API 를 HTTP 로 확인한다. 솔버는 가짜로 바꿔 호출 횟수를 센다.
 *
 * 전공 A01(가나다학과)·B01(나다라학과)
 *   C100 자료구조   A: 월 09:00-10:30, B: 화 09:00-10:30   A01 전필 2학년 / B01 전선 3학년
 *   C200 운영체제   A: 월 10:00-11:30 (자료구조 A 와 겹침)   A01 전선 3학년
 *   C300 글쓰기     A: 온라인                              A01 교필 전학년
 *   C400 야간세미나 A: 수 12:00-13:30, 야간                 A01 전선 2학년
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig::class, TimetableApiTest.StubSolverConfig::class)
class TimetableApiTest(
	@Autowired private val mvc: MockMvc,
	@Autowired private val jdbc: JdbcTemplate,
	@Autowired private val ingest: SemesterIngestService,
	@Autowired private val solver: StubSolver,
) {
	@TestConfiguration
	class StubSolverConfig {
		@Bean
		@Primary
		fun stubSolver() = StubSolver()
	}

	/** 후보 앞에서부터 둘씩 묶어 해 3개를 돌려준다 */
	class StubSolver : TimetableSolver {
		var calls = 0
		var fail = false
		var lastRequest: SolverRequest? = null

		override fun solve(request: SolverRequest): SolverResult {
			calls++
			lastRequest = request
			if (fail) throw ResponseStatusException(HttpStatus.BAD_GATEWAY, "시간표 추천 서버 호출에 실패했습니다")
			val ids = request.filteredData.map { it.id.toLong() }
			return SolverResult(3, (0 until 3).map { i ->
				StoredSolution(i, 6, 0, 3, 3, 0, 2, 0, listOf("FRI"), ids.drop(i).take(2))
			})
		}
	}

	private lateinit var lectureId: Map<String, String>
	private var majorA = ""

	@BeforeEach
	fun setUp() {
		jdbc.execute("truncate semester, major, course restart identity cascade")
		solver.calls = 0
		solver.fail = false

		fun row(code: String, name: String, section: String, type: RequirementType, grade: Int,
				times: List<SchedulePayload> = emptyList(), dayOrNight: DayOrNight = DayOrNight.DAY) = CoursePayload(
			code = code, name = name, credit = 3, requirementType = type, grade = grade, section = section,
			deliveryMethod = if (times.isEmpty()) DeliveryMethod.ONLINE else DeliveryMethod.FACE_TO_FACE,
			dayOrNight = dayOrNight, professors = "교수$code", onlineHour = if (times.isEmpty()) 3.0 else 0.0,
			offlineSchedules = times,
		)
		fun at(day: Weekday, start: Int, end: Int) = SchedulePayload(day, start, end, "상상관101")

		ingest.replace(
			SemesterIngestRequest(
				year = 2026, term = 2, scrapedAt = OffsetDateTime.parse("2026-11-22T07:53:35Z"),
				majors = listOf(
					MajorPayload("A01", "가나다학과", listOf(
						row("C100", "자료구조", "A", RequirementType.MAJOR_REQUIRED, 2, listOf(at(Weekday.MON, 540, 630))),
						row("C100", "자료구조", "B", RequirementType.MAJOR_REQUIRED, 2, listOf(at(Weekday.TUE, 540, 630))),
						row("C200", "운영체제", "A", RequirementType.MAJOR_ELECTIVE, 3, listOf(at(Weekday.MON, 600, 690))),
						row("C300", "글쓰기", "A", RequirementType.GENERAL_REQUIRED, 0),
						row("C400", "야간세미나", "A", RequirementType.MAJOR_ELECTIVE, 2, listOf(at(Weekday.WED, 720, 810)), DayOrNight.NIGHT),
					)),
					MajorPayload("B01", "나다라학과", listOf(
						row("C100", "자료구조", "A", RequirementType.MAJOR_ELECTIVE, 3, listOf(at(Weekday.MON, 540, 630))),
						row("C100", "자료구조", "B", RequirementType.MAJOR_ELECTIVE, 3, listOf(at(Weekday.TUE, 540, 630))),
					)),
				),
			),
		)
		lectureId = jdbc.query("select c.code || '-' || l.section k, l.id from lecture l join course c on c.id = l.course_id") { rs, _ ->
			rs.getString("k") to rs.getLong("id").toString()
		}.toMap()
		majorA = jdbc.queryForObject("select id::text from major where code = 'A01'", String::class.java)!!
	}

	@Test
	fun `학기 목록과 그 학기 전공 목록을 감싼 응답으로 돌려준다`() {
		mvc.get("/api/semesters").andExpect {
			status { isOk() }
			jsonPath("$.success") { value(true) }
			jsonPath("$.data[0].id") { value("2026-2") }
			jsonPath("$.data[0].scraped_at") { exists() }
		}
		mvc.get("/api/semesters/2026-2/majors").andExpect {
			jsonPath("$.data[*].code") { value(contains("A01", "B01")) }
			jsonPath("$.data[0].id") { isString() }
		}
		mvc.get("/api/semesters/2099-1/majors").andExpect {
			status { isNotFound() }
			jsonPath("$.success") { value(false) }
			jsonPath("$.error") { value("NOT_FOUND") }
		}
	}

	@Test
	fun `브라우저에서 다른 도메인의 프론트가 api 를 부를 수 있고 admin 은 허용하지 않는다`() {
		mvc.options("/api/semesters/2026-2/lectures/search") {
			header("Origin", "https://hsu-auto-scheduler.vercel.app")
			header("Access-Control-Request-Method", "POST")
			header("Access-Control-Request-Headers", "content-type")
		}.andExpect {
			status { isOk() }
			header { string("Access-Control-Allow-Origin", "https://hsu-auto-scheduler.vercel.app") }
		}
		mvc.options("/admin/semesters/2026-2") {
			header("Origin", "https://hsu-auto-scheduler.vercel.app")
			header("Access-Control-Request-Method", "PUT")
		}.andExpect { header { doesNotExist("Access-Control-Allow-Origin") } }
	}

	@Test
	fun `필터 없이 조회하면 과목코드·분반 순으로 페이지를 나눈다`() {
		search("""{"page":1,"size":2}""").andExpect {
			jsonPath("$.data.courses[*].code") { value(contains("C100", "C100")) }
			jsonPath("$.data.courses[*].section") { value(contains("A", "B")) }
			jsonPath("$.data.total_count") { value(5) }
			jsonPath("$.data.has_next") { value(true) }
		}
		search("""{"page":3,"size":2}""").andExpect {
			jsonPath("$.data.courses[*].code") { value(contains("C400")) }
			jsonPath("$.data.has_next") { value(false) }
		}
	}

	@Test
	fun `강의 응답은 기존 프론트 courseSchema 모양이다`() {
		search("""{"search":"글쓰기"}""").andExpect {
			jsonPath("$.data.courses[0].id") { value(lectureId.getValue("C300-A")) }
			jsonPath("$.data.courses[0].course_id") { isString() }
			jsonPath("$.data.courses[0].online_hour") { value(3.0) }
			jsonPath("$.data.courses[0].grades") { value(contains(0)) }
			jsonPath("$.data.courses[0].grade_limits") { isEmpty() }
			jsonPath("$.data.courses[0].offline_schedules") { isEmpty() }
		}
	}

	@Test
	fun `이수구분·학년은 전공을 고르면 그 전공 값, 안 고르면 모든 전공 값을 모은다`() {
		search("""{"search":"C100","size":1}""").andExpect {
			jsonPath("$.data.courses[0].requirement_types") { value(contains("MAJOR_REQUIRED", "MAJOR_ELECTIVE")) }
			jsonPath("$.data.courses[0].grades") { value(contains(2, 3)) }
		}
		search("""{"search":"C100","size":1,"major_id":"$majorA"}""").andExpect {
			jsonPath("$.data.courses[0].requirement_types") { value(contains("MAJOR_REQUIRED")) }
			jsonPath("$.data.courses[0].grades") { value(contains(2)) }
		}
	}

	@Test
	fun `전공·학년, 공강 요일, 고른 강의, 점심시간 필터`() {
		search("""{"major_id":"$majorA","grade":2}""").andExpect {
			jsonPath("$.data.courses[*].code") { value(contains("C100", "C100", "C300", "C400")) }
		}
		// 월요일에 수업이 있는 분반은 시간표가 잘리지 않고 통째로 빠진다
		search("""{"no_class_days":["MON"]}""").andExpect {
			jsonPath("$.data.courses[*].code") { value(contains("C100", "C300", "C400")) }
			jsonPath("$.data.courses[0].offline_schedules", hasSize<Any>(1))
		}
		search("""{"selected_lecture_ids":["${lectureId.getValue("C100-A")}"]}""").andExpect {
			jsonPath("$.data.courses[*].code") { value(contains("C300", "C400")) }
		}
		search("""{"has_lunch_break":true,"day_or_night":"NIGHT"}""").andExpect {
			jsonPath("$.data.courses") { isEmpty() }
		}
		search("""{"personal_schedules":[{"id":"p","personal_schedule_name":"알바","offline_schedules":[{"id":"x","day":"TUE","start_time":500,"end_time":560,"place":""}]}]}""").andExpect {
			jsonPath("$.data.courses[*].code") { value(contains("C100", "C200", "C300", "C400")) }
		}
	}

	@Test
	fun `학기를 다시 저장하면 조회 캐시가 비워져 바뀐 데이터가 보인다`() {
		search("""{"search":"운영체제"}""").andExpect { jsonPath("$.data.total_count") { value(1) } }

		// 운영체제가 폐강된 학기를 다시 저장
		ingest.replace(
			SemesterIngestRequest(
				year = 2026, term = 2,
				majors = listOf(
					MajorPayload("A01", "가나다학과", listOf(
						CoursePayload(
							code = "C300", name = "글쓰기", credit = 3, requirementType = RequirementType.GENERAL_REQUIRED, grade = 0,
							section = "A", deliveryMethod = DeliveryMethod.ONLINE, dayOrNight = DayOrNight.DAY,
							professors = "교수C300", onlineHour = 3.0, offlineSchedules = emptyList(),
						),
					)),
				),
			),
		)

		search("""{"search":"운영체제"}""").andExpect { jsonPath("$.data.total_count") { value(0) } }
		search("{}").andExpect { jsonPath("$.data.total_count") { value(1) } }
	}

	@Test
	fun `그 학기에 없는 분반 id 나 잘못된 값이면 400`() {
		search("""{"selected_lecture_ids":["999999"]}""").andExpect {
			status { isBadRequest() }
			jsonPath("$.success") { value(false) }
		}
		search("""{"grade":7}""").andExpect { status { isBadRequest() } }
		search("""{"day_or_night":"MORNING"}""").andExpect { status { isBadRequest() } }
		// 리스트 안의 값도 검증한다 (개인 일정 시각이 하루를 넘음)
		search("""{"personal_schedules":[{"offline_schedules":[{"day":"MON","start_time":600,"end_time":2000}]}]}""").andExpect {
			status { isBadRequest() }
			jsonPath("$.message") { value(org.hamcrest.Matchers.containsString("endTime")) }
		}
	}

	@Test
	fun `시간표 추천은 첫 페이지에서만 솔버를 부르고 다음 페이지는 캐시에서 준다`() {
		val selectedId = lectureId.getValue("C100-A")
		recommend(page = 1, selected = selectedId).andExpect {
			status { isOk() }
			jsonPath("$.data.total_solution_count") { value(3) }
			jsonPath("$.data.solutions", hasSize<Any>(2))
			jsonPath("$.data.solutions[0].selected_courses[0].id") { value(selectedId) }
			// 추천에서는 고른 전공(A01) 기준 이수구분이다
			jsonPath("$.data.solutions[0].selected_courses[0].requirement_types") { value(contains("MAJOR_REQUIRED")) }
		}
		recommend(page = 2, selected = selectedId).andExpect {
			jsonPath("$.data.solutions", hasSize<Any>(1))
			jsonPath("$.data.solutions[0].solution_index") { value(2) }
		}
		assertThat(solver.calls).isEqualTo(1)

		// 솔버에는 고른 강의가 후보와 pre_selected 양쪽에 들어간다.
		// 같은 과목(C100-B)·겹치는 분반(C200-A)·야간 분반(C400-A, 주간 요청)은 후보에서 빠진다
		val sent = solver.lastRequest!!
		assertThat(sent.preSelectedCourses.map { it.id }).containsExactly(selectedId)
		assertThat(sent.filteredData.map { "${it.code}-${it.section}" }).containsExactly("C100-A", "C300-A")
		assertThat(sent.constraints.maxCredit).isEqualTo(18)

		// 조건이 바뀌면 다시 푼다
		recommend(page = 1, selected = null).andExpect { status { isOk() } }
		assertThat(solver.calls).isEqualTo(2)
	}

	@Test
	fun `시간표 추천은 전공·학년·주야가 필수이고, 솔버가 실패하면 502`() {
		mvc.post("/api/semesters/2026-2/timetables") {
			contentType = MediaType.APPLICATION_JSON
			content = """{"grade":2,"day_or_night":"DAY","constraints":{"max_credit":18,"major_basic":0,"major_required":0,"major_elective":0,"daily_lecture_limit":3}}"""
		}.andExpect {
			status { isBadRequest() }
			jsonPath("$.message") { value(org.hamcrest.Matchers.containsString("majorId")) }
		}

		solver.fail = true
		recommend(page = 1, selected = null).andExpect {
			status { isBadGateway() }
			jsonPath("$.success") { value(false) }
		}
	}

	private fun search(body: String): ResultActionsDsl = mvc.post("/api/semesters/2026-2/lectures/search") {
		contentType = MediaType.APPLICATION_JSON
		content = body
	}

	private fun recommend(page: Int, selected: String?): ResultActionsDsl = mvc.post("/api/semesters/2026-2/timetables") {
		contentType = MediaType.APPLICATION_JSON
		content = """
			{"page":$page,"size":2,"major_id":"$majorA","grade":2,"day_or_night":"DAY",
			 "selected_lecture_ids":[${selected?.let { "\"$it\"" } ?: ""}],
			 "constraints":{"max_credit":18,"major_basic":0,"major_required":3,"major_elective":3,"daily_lecture_limit":3}}
		""".trimIndent()
	}
}
