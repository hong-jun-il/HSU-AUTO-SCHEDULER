package com.hsuautoscheduler.api.domain

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface SemesterRepository : JpaRepository<Semester, String> {
	fun findAllByOrderByYearDescTermDesc(): List<Semester>
}

interface MajorRepository : JpaRepository<Major, Long> {
	/** 그 학기에 과목이 하나라도 있는 전공 */
	@Query(
		"""
		select m from Major m
		where exists (select 1 from MajorCourse mc where mc.major = m and mc.semesterId = :semesterId)
		order by m.name, m.code
		""",
	)
	fun findOfferedIn(semesterId: String): List<Major>
}
