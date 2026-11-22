package com.hsuautoscheduler.be.domain

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

/** 분반: 학기 + 과목 + 분반이 하나의 강의. 화면에 보이는 과목 정보는 여기서 읽는다 */
@Entity
@Table(name = "lecture")
class Lecture(
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long = 0,

	val semesterId: String,

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id")
	val course: Course,

	/** 분반 (A, N, 7, @ ...) */
	val section: String,

	/** 종정시에 보이는 분반의 과목명 (예: "상상설계 진로1(상상더학기)") */
	val name: String,

	@JdbcTypeCode(SqlTypes.SMALLINT)
	val credit: Int,

	@Enumerated(EnumType.STRING)
	val deliveryMethod: DeliveryMethod,

	@Enumerated(EnumType.STRING)
	val dayOrNight: DayOrNight,

	/** 쉼표 구분 원문, 미정은 '강사' */
	val professors: String,

	/** 온라인강좌 시간(분). "온라인강좌 1.5시간" → 90 */
	@JdbcTypeCode(SqlTypes.SMALLINT)
	val onlineMinutes: Int,

	/** 학년제한 */
	@JdbcTypeCode(SqlTypes.SMALLINT)
	val gradeLimit: Int?,

	/** 수업계획서 코드 */
	val planCode: String?,

	/** 비고 (수강인원, PF과목 …) */
	val remark: String?,

	/** 종정시 강의실/교시 원문 (예: "상상관503 월8M~9M / 상상관604 수8M~9M") */
	val classroomRaw: String,

	@OneToMany(mappedBy = "lecture")
	val offlineSchedules: List<OfflineSchedule> = emptyList(),
)
