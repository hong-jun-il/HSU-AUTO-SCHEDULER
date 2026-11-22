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

/** 분반의 오프라인 수업 한 번. 시각은 자정부터의 분 (09:00 = 540) */
@Entity
@Table(name = "offline_schedule")
class OfflineSchedule(
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long = 0,

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lecture_id")
	val lecture: Lecture,

	@Enumerated(EnumType.STRING)
	val day: Weekday,

	@JdbcTypeCode(SqlTypes.SMALLINT)
	val startTime: Int,

	@JdbcTypeCode(SqlTypes.SMALLINT)
	val endTime: Int,

	val place: String,
)
