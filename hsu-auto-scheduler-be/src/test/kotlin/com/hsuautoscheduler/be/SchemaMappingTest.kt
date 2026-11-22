package com.hsuautoscheduler.be

import com.hsuautoscheduler.be.domain.DayOrNight
import com.hsuautoscheduler.be.domain.DeliveryMethod
import com.hsuautoscheduler.be.domain.Lecture
import com.hsuautoscheduler.be.domain.MajorCourse
import com.hsuautoscheduler.be.domain.RequirementType
import com.hsuautoscheduler.be.domain.Semester
import com.hsuautoscheduler.be.domain.Weekday
import jakarta.persistence.EntityManager
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.transaction.annotation.Transactional

/**
 * 컨텍스트가 뜬다 = Flyway 가 V1 을 적용했고, Hibernate(ddl-auto: validate)가 엔티티와 테이블이 맞다고 판단했다.
 * 그 위에서 SQL 로 넣은 행을 엔티티로 읽어 컬럼 매핑을 확인한다.
 */
@SpringBootTest
@Import(TestcontainersConfig::class)
@Transactional
class SchemaMappingTest(
	@Autowired private val jdbc: JdbcTemplate,
	@Autowired private val em: EntityManager,
) {
	@Test
	fun `SQL 로 넣은 학기 데이터를 엔티티로 읽는다`() {
		jdbc.update("insert into semester (id, year, term, scraped_at) values ('2026-2', 2026, 2, '2026-11-22T07:53:35Z')")
		jdbc.update("insert into major (id, code, name) values (1, 'P012', '영미언어정보트랙')")
		jdbc.update("insert into course (id, code, name) values (1, 'M111005', '상상설계 진로1')")
		jdbc.update("insert into major_course (semester_id, major_id, course_id, requirement_type, grade) values ('2026-2', 1, 1, 'MAJOR_ELECTIVE', 0)")
		jdbc.update(
			"""
			insert into lecture (id, semester_id, course_id, section, name, credit, delivery_method, day_or_night,
			                     professors, online_minutes, grade_limit, plan_code, remark, classroom_raw)
			values (1, '2026-2', 1, 'Z', '상상설계 진로1(상상더학기)', 3, 'BLENDED', 'BOTH',
			        '박종언,홍승진', 90, 1, '20262110558M111005Z', 'PF과목', '온라인강좌 1.5시간 / 상상관603 수8M~9M')
			""",
		)
		jdbc.update("insert into offline_schedule (lecture_id, day, start_time, end_time, place) values (1, 'WED', 990, 1080, '상상관603')")

		val semester = em.find(Semester::class.java, "2026-2")
		assertThat(semester.term).isEqualTo(2)
		assertThat(semester.scrapedAt).isNotNull()

		val lecture = em.find(Lecture::class.java, 1L)
		assertThat(lecture.name).isEqualTo("상상설계 진로1(상상더학기)")
		assertThat(lecture.course.name).isEqualTo("상상설계 진로1")
		assertThat(lecture.deliveryMethod).isEqualTo(DeliveryMethod.BLENDED)
		assertThat(lecture.dayOrNight).isEqualTo(DayOrNight.BOTH)
		assertThat(lecture.onlineMinutes).isEqualTo(90)
		assertThat(lecture.gradeLimit).isEqualTo(1)
		assertThat(lecture.offlineSchedules).singleElement().satisfies({
			assertThat(it.day).isEqualTo(Weekday.WED)
			assertThat(it.startTime).isEqualTo(990)
			assertThat(it.endTime).isEqualTo(1080)
		})

		val majorCourse = em.createQuery("select mc from MajorCourse mc", MajorCourse::class.java).singleResult
		assertThat(majorCourse.requirementType).isEqualTo(RequirementType.MAJOR_ELECTIVE)
		assertThat(majorCourse.grade).isEqualTo(0)
		assertThat(majorCourse.major.code).isEqualTo("P012")
	}
}
