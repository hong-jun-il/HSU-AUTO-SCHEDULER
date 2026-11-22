package com.hsuautoscheduler.be.ingest

import com.hsuautoscheduler.be.TestcontainersConfig
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActionsDsl
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.node.ArrayNode
import tools.jackson.databind.node.ObjectNode
import java.io.File

/**
 * 스크래퍼가 만든 2026-2 변환 파일(payload.json)을 그대로 PUT 해서 학기 저장을 확인한다.
 * 수집 파일은 git 에 올리지 않으므로 파일이 없으면 건너뛴다 (`npm run send -- 2026-2 --dry-run` 으로 만든다).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig::class)
class SemesterIngestRealDataTest(
	@Autowired private val mvc: MockMvc,
	@Autowired private val jdbc: JdbcTemplate,
	@Autowired private val mapper: ObjectMapper,
) {
	private val dataDir = File("../hsu-auto-scheduler-scraper/data")
	private val payloadFile = File(dataDir, "hsuinfo-2026-2.payload.json")

	@BeforeEach
	fun setUp() {
		assumeTrue(payloadFile.isFile, "$payloadFile 이 없어서 건너뜀")
		jdbc.execute("truncate semester, major, course restart identity cascade")
	}

	@Test
	fun `2026-2 변환 파일을 그대로 저장하면 행 수가 수집 실측값과 같다`() {
		put(payload()).andExpect {
			status { isOk() }
			jsonPath("$.lectures") { value(1489) }
			jsonPath("$.deleted_lectures") { value(0) }
		}

		assertThat(counts()).isEqualTo(
			mapOf(
				"semester" to 1, "major" to 110, "course" to 778,
				"major_course" to 1393, "lecture" to 1489, "offline_schedule" to 1502,
			),
		)

		// 대표 이름은 접미사 없는 쪽, 분반 이름은 종정시 그대로
		assertThat(jdbc.queryForList(
			"select l.section, l.name, c.name course_name from lecture l join course c on c.id = l.course_id where c.code = 'M111005' order by l.section",
		)).containsExactly(
			mapOf("section" to "7", "name" to "상상설계 진로1", "course_name" to "상상설계 진로1"),
			mapOf("section" to "Z", "name" to "상상설계 진로1(상상더학기)", "course_name" to "상상설계 진로1"),
		)
		// 학년제한은 분반마다 다르다
		assertThat(jdbc.queryForList(
			"select l.section from lecture l join course c on c.id = l.course_id where c.code = 'R010057' and l.grade_limit = 1",
			String::class.java,
		)).containsExactly("8")
		// 온라인 시간은 분으로 저장된다
		assertThat(jdbc.queryForList("select distinct online_minutes from lecture order by 1", Int::class.java))
			.containsExactly(0, 60, 90, 120, 180, 240)
		// 수집 시각과 강의실 원문
		assertThat(jdbc.queryForObject("select scraped_at::text from semester", String::class.java))
			.isEqualTo("2026-11-22 16:53:35.655+09")
		assertThat(jdbc.queryForObject(
			"select l.classroom_raw from lecture l join course c on c.id = l.course_id where c.code = 'P010182' and l.section = 'A'",
			String::class.java,
		)).isEqualTo("탐구관307  수4~5,목2M~3M")
	}

	@Test
	fun `같은 파일을 다시 보내도 행 수와 분반 id 가 그대로다`() {
		put(payload()).andExpect { status { isOk() } }
		val before = lectureIds()

		put(payload()).andExpect { status { isOk() } }

		assertThat(counts()["lecture"]).isEqualTo(1489)
		assertThat(counts()["offline_schedule"]).isEqualTo(1502)
		assertThat(counts()["major_course"]).isEqualTo(1393)
		assertThat(lectureIds()).isEqualTo(before)
	}

	@Test
	fun `바뀐 분반은 갱신되고 예전 시간표가 남지 않으며 없어진 분반은 지워진다`() {
		put(payload()).andExpect { status { isOk() } }
		val idA = lectureIds().getValue("P010182-A")

		// P010182-A: 교수와 시간이 바뀜 (이 분반은 P012, P01B 두 전공에 나온다)
		// P010182-N: 폐강
		val changed = payload()
		forEachRow(changed) { major, row ->
			if (row["code"].asString() != "P010182") return@forEachRow
			when (row["section"].asString()) {
				"A" -> {
					row.put("professors", "테스트교수")
					row.set("offline_schedules", mapper.readTree("""[{"day":"FRI","start_time":540,"end_time":720,"place":"상상관101"}]"""))
				}
				"N" -> major.remove((0 until major.size()).first { major[it] === row })
			}
		}

		put(changed).andExpect {
			status { isOk() }
			jsonPath("$.deleted_lectures") { value(1) }
		}

		assertThat(counts()["lecture"]).isEqualTo(1488)
		assertThat(lectureIds()).doesNotContainKey("P010182-N")
		assertThat(lectureIds()["P010182-A"]).isEqualTo(idA)
		assertThat(jdbc.queryForObject("select professors from lecture where id = ?", String::class.java, idA)).isEqualTo("테스트교수")
		assertThat(jdbc.queryForList("select day, start_time, end_time, place from offline_schedule where lecture_id = ?", idA))
			.containsExactly(mapOf("day" to "FRI", "start_time" to 540, "end_time" to 720, "place" to "상상관101"))
	}

	@Test
	fun `같은 분반이 전공마다 다르게 오면 아무것도 저장하지 않는다`() {
		put(payload()).andExpect { status { isOk() } }
		val before = counts()

		// P010182-A 의 교수를 P012 전공 목록에서만 바꾼다
		val conflicting = payload()
		val p012 = (conflicting["majors"] as ArrayNode).first { it["code"].asString() == "P012" }
		(p012["courses"] as ArrayNode)
			.first { it["code"].asString() == "P010182" && it["section"].asString() == "A" }
			.let { (it as ObjectNode).put("professors", "다른교수") }

		put(conflicting).andExpect {
			status { isUnprocessableContent() }
			jsonPath("$.conflicts[0]") { value("[P010182-A] 전공 P01B 의 분반 정보가 다른 전공과 다름") }
		}
		assertThat(counts()).isEqualTo(before)
	}

	@Test
	fun `실데이터에서 공강 요일 필터는 그 요일 수업이 있는 분반을 통째로 빼고 시간표는 자르지 않는다`() {
		put(payload()).andExpect { status { isOk() } }

		val body = mvc.post("/api/semesters/2026-2/lectures/search") {
			contentType = MediaType.APPLICATION_JSON
			content = """{"size":100,"no_class_days":["MON","FRI"]}"""
		}.andExpect { status { isOk() } }.andReturn().response.contentAsString
		val data = mapper.readTree(body)["data"]

		val expected = jdbc.queryForObject(
			"select count(*) from lecture l where not exists (select 1 from offline_schedule o where o.lecture_id = l.id and o.day in ('MON', 'FRI'))",
			Int::class.java,
		)
		assertThat(data["total_count"].asInt()).isEqualTo(expected)
		for (course in data["courses"]) {
			val days = course["offline_schedules"].toList().map { it["day"].asString() }
			assertThat(days).doesNotContain("MON", "FRI")
			val stored = jdbc.queryForObject("select count(*) from offline_schedule where lecture_id = ?", Int::class.java, course["id"].asString().toLong())
			assertThat(days).hasSize(stored!!)
		}
	}

	@Test
	fun `토큰이 없거나 경로와 본문의 학기가 다르면 거절한다`() {
		mvc.put("/admin/semesters/2026-2") {
			contentType = MediaType.APPLICATION_JSON
			content = payloadFile.readText()
		}.andExpect { status { isUnauthorized() } }

		put(payload(), path = "2026-1").andExpect { status { isBadRequest() } }
		assertThat(counts()["semester"]).isEqualTo(0)
	}

	private fun payload(): ObjectNode = mapper.readTree(payloadFile) as ObjectNode

	private fun put(body: JsonNode, path: String = "2026-2"): ResultActionsDsl =
		mvc.put("/admin/semesters/$path") {
			contentType = MediaType.APPLICATION_JSON
			header("X-Admin-Token", "test-admin-token")
			content = mapper.writeValueAsString(body)
		}

	private fun forEachRow(body: ObjectNode, action: (ArrayNode, ObjectNode) -> Unit) {
		for (major in body["majors"]) {
			val courses = major["courses"] as ArrayNode
			for (row in courses.toList()) action(courses, row as ObjectNode)
		}
	}

	private fun counts(): Map<String, Int> =
		listOf("semester", "major", "course", "major_course", "lecture", "offline_schedule")
			.associateWith { jdbc.queryForObject("select count(*) from $it", Int::class.java)!! }

	/** "과목코드-분반" → lecture id */
	private fun lectureIds(): Map<String, Long> =
		jdbc.query("select c.code || '-' || l.section k, l.id from lecture l join course c on c.id = l.course_id") { rs, _ ->
			rs.getString("k") to rs.getLong("id")
		}.toMap()
}
