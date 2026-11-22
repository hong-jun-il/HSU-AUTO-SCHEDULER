package com.hsuautoscheduler.api.domain

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

/** 학기별 전공-과목: 그 학기에 이 전공이 이 과목을 어떤 이수구분·몇 학년으로 여는지 */
@Entity
@Table(name = "major_course")
class MajorCourse(
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long = 0,

	val semesterId: String,

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "major_id")
	val major: Major,

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id")
	val course: Course,

	@Enumerated(EnumType.STRING)
	val requirementType: RequirementType,

	/** 1~4, 0 = 전학년 */
	@JdbcTypeCode(SqlTypes.SMALLINT)
	val grade: Int,
)
