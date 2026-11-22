package com.hsuautoscheduler.api.ingest

import org.springframework.context.ApplicationEventPublisher
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Types

/**
 * 학기 하나를 통째로 교체한다. 한 트랜잭션이라 중간에 실패하면 아무것도 바뀌지 않는다.
 *
 * - major·course: 코드 기준 upsert (학기 간 공유, 이름은 최신 값)
 * - lecture: (학기, 과목, 분반) 기준 upsert → 이미 있던 분반은 id 가 그대로다. 이번 데이터에 없는 분반은 지운다
 * - offline_schedule·major_course: 그 학기 것을 지우고 새로 넣는다
 *
 * JPA 대신 SQL 을 쓰는 이유: upsert(ON CONFLICT)와 학기 단위 삭제가 그대로 한 문장이 되고,
 * IDENTITY id 에서도 JDBC 배치가 된다.
 */
@Service
class SemesterIngestService(
	private val jdbc: NamedParameterJdbcTemplate,
	private val events: ApplicationEventPublisher,
) {
	@Transactional
	fun replace(request: SemesterIngestRequest): IngestResult {
		val snapshot = SemesterSnapshot.from(request)
		val semesterId = request.semesterId

		jdbc.update(
			"""
			insert into semester (id, year, term, scraped_at) values (:id, :year, :term, :scrapedAt)
			on conflict (id) do update set scraped_at = excluded.scraped_at
			""",
			MapSqlParameterSource()
				.addValue("id", semesterId)
				.addValue("year", request.year)
				.addValue("term", request.term)
				.addValue("scrapedAt", request.scrapedAt, Types.TIMESTAMP_WITH_TIMEZONE),
		)

		val majorIds = upsertByCode("major", snapshot.majors.associate { it.code to it.name })
		val courseIds = upsertByCode("course", snapshot.courses.associate { it.code to it.name })

		// 분반 upsert 후 그 학기 분반 id 를 다시 읽는다 (배치 insert 는 RETURNING 을 돌려주지 않는다)
		batch(
			"""
			insert into lecture (semester_id, course_id, section, name, credit, delivery_method, day_or_night,
			                     professors, online_minutes, grade_limit, plan_code, remark, classroom_raw)
			values (:semesterId, :courseId, :section, :name, :credit, :deliveryMethod, :dayOrNight,
			        :professors, :onlineMinutes, :gradeLimit, :planCode, :remark, :classroomRaw)
			on conflict (semester_id, course_id, section) do update set
			    name = excluded.name, credit = excluded.credit, delivery_method = excluded.delivery_method,
			    day_or_night = excluded.day_or_night, professors = excluded.professors,
			    online_minutes = excluded.online_minutes, grade_limit = excluded.grade_limit,
			    plan_code = excluded.plan_code, remark = excluded.remark, classroom_raw = excluded.classroom_raw
			""",
			snapshot.lectures.map {
				MapSqlParameterSource()
					.addValue("semesterId", semesterId)
					.addValue("courseId", courseIds.getValue(it.courseCode))
					.addValue("section", it.section)
					.addValue("name", it.name)
					.addValue("credit", it.credit)
					.addValue("deliveryMethod", it.deliveryMethod.name)
					.addValue("dayOrNight", it.dayOrNight.name)
					.addValue("professors", it.professors)
					.addValue("onlineMinutes", it.onlineMinutes)
					.addValue("gradeLimit", it.gradeLimit, Types.SMALLINT)
					.addValue("planCode", it.planCode, Types.VARCHAR)
					.addValue("remark", it.remark, Types.VARCHAR)
					.addValue("classroomRaw", it.classroomRaw)
			},
		)

		val lectureIds = HashMap<Pair<Long, String>, Long>()
		jdbc.query(
			"select id, course_id, section from lecture where semester_id = :semesterId",
			mapOf("semesterId" to semesterId),
		) { rs -> lectureIds[rs.getLong("course_id") to rs.getString("section")] = rs.getLong("id") }

		fun lectureId(lecture: SemesterSnapshot.LectureRow): Long =
			lectureIds.getValue(courseIds.getValue(lecture.courseCode) to lecture.section)

		val keep = snapshot.lectures.map(::lectureId).toSet()
		val stale = lectureIds.values.filterNot { it in keep }
		if (stale.isNotEmpty()) {
			// offline_schedule 은 ON DELETE CASCADE 로 같이 지워진다
			jdbc.update("delete from lecture where id in (:ids)", mapOf("ids" to stale))
		}

		jdbc.update(
			"delete from offline_schedule where lecture_id in (select id from lecture where semester_id = :semesterId)",
			mapOf("semesterId" to semesterId),
		)
		val schedules = snapshot.lectures.flatMap { lecture ->
			lecture.schedules.map {
				MapSqlParameterSource()
					.addValue("lectureId", lectureId(lecture))
					.addValue("day", it.day)
					.addValue("startTime", it.startTime)
					.addValue("endTime", it.endTime)
					.addValue("place", it.place)
			}
		}
		batch(
			"insert into offline_schedule (lecture_id, day, start_time, end_time, place) values (:lectureId, :day, :startTime, :endTime, :place)",
			schedules,
		)

		jdbc.update("delete from major_course where semester_id = :semesterId", mapOf("semesterId" to semesterId))
		batch(
			"""
			insert into major_course (semester_id, major_id, course_id, requirement_type, grade)
			values (:semesterId, :majorId, :courseId, :requirementType, :grade)
			""",
			snapshot.majorCourses.map {
				MapSqlParameterSource()
					.addValue("semesterId", semesterId)
					.addValue("majorId", majorIds.getValue(it.majorCode))
					.addValue("courseId", courseIds.getValue(it.courseCode))
					.addValue("requirementType", it.requirementType.name)
					.addValue("grade", it.grade)
			},
		)

		// 조회 캐시는 커밋된 뒤에 비운다 (SemesterCatalogCache)
		events.publishEvent(SemesterReplacedEvent(semesterId))

		return IngestResult(
			semesterId = semesterId,
			majors = snapshot.majors.size,
			courses = snapshot.courses.size,
			lectures = snapshot.lectures.size,
			deletedLectures = stale.size,
			majorCourses = snapshot.majorCourses.size,
			offlineSchedules = schedules.size,
		)
	}

	/** code → name 을 code 기준으로 upsert 하고 code → id 를 돌려준다 */
	private fun upsertByCode(table: String, namesByCode: Map<String, String>): Map<String, Long> {
		if (namesByCode.isEmpty()) return emptyMap()
		batch(
			"insert into $table (code, name) values (:code, :name) on conflict (code) do update set name = excluded.name",
			namesByCode.map { (code, name) -> MapSqlParameterSource().addValue("code", code).addValue("name", name) },
		)
		return jdbc.query(
			"select id, code from $table where code in (:codes)",
			mapOf("codes" to namesByCode.keys),
		) { rs, _ -> rs.getString("code") to rs.getLong("id") }.toMap()
	}

	private fun batch(sql: String, rows: List<MapSqlParameterSource>) {
		if (rows.isNotEmpty()) jdbc.batchUpdate(sql, rows.toTypedArray())
	}
}

data class IngestResult(
	val semesterId: String,
	val majors: Int,
	val courses: Int,
	val lectures: Int,
	val deletedLectures: Int,
	val majorCourses: Int,
	val offlineSchedules: Int,
)
