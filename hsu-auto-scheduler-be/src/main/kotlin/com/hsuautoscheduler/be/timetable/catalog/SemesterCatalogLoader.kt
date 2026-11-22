package com.hsuautoscheduler.be.timetable.catalog

import com.hsuautoscheduler.be.domain.Lecture
import com.hsuautoscheduler.be.domain.RequirementType
import com.hsuautoscheduler.be.domain.SemesterRepository
import jakarta.persistence.EntityManager
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

/** 학기 하나를 쿼리 두 번(분반+과목+시간표, 전공-과목)으로 읽어 SemesterCatalog 로 만든다 */
@Component
class SemesterCatalogLoader(
	private val em: EntityManager,
	private val semesters: SemesterRepository,
) {
	@Transactional(readOnly = true)
	fun load(semesterId: String): SemesterCatalog {
		if (!semesters.existsById(semesterId)) {
			throw ResponseStatusException(HttpStatus.NOT_FOUND, "없는 학기입니다: $semesterId")
		}
		val loadedAt = Instant.now()

		val offeringsByCourse = em.createQuery(
			"select mc.course.id, mc.major.id, mc.requirementType, mc.grade from MajorCourse mc where mc.semesterId = :semesterId",
			Array<Any>::class.java,
		).setParameter("semesterId", semesterId).resultList
			.groupBy({ it[0] as Long }, { Offering(it[1] as Long, it[2] as RequirementType, it[3] as Int) })

		val lectures = em.createQuery(
			"""
			select distinct l from Lecture l
			join fetch l.course
			left join fetch l.offlineSchedules
			where l.semesterId = :semesterId
			""",
			Lecture::class.java,
		).setParameter("semesterId", semesterId).resultList
			.map { l ->
				CatalogLecture(
					id = l.id,
					courseId = l.course.id,
					code = l.course.code,
					section = l.section,
					name = l.name,
					credit = l.credit,
					deliveryMethod = l.deliveryMethod,
					dayOrNight = l.dayOrNight,
					professors = l.professors,
					onlineMinutes = l.onlineMinutes,
					gradeLimit = l.gradeLimit,
					planCode = l.planCode,
					remark = l.remark,
					schedules = l.offlineSchedules
						.map { CatalogSchedule(it.id, it.day, it.startTime, it.endTime, it.place) }
						.sortedWith(compareBy({ it.day.ordinal }, { it.startTime })),
					offerings = offeringsByCourse[l.course.id].orEmpty()
						.sortedWith(compareBy({ it.majorId }, { it.requirementType.ordinal })),
				)
			}
			.sortedWith(compareBy({ it.code }, { it.section }))

		return SemesterCatalog(semesterId, loadedAt, lectures)
	}
}
