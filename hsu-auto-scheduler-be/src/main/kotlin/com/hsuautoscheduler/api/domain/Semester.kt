package com.hsuautoscheduler.api.domain

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime

/** 학기. id 는 '2026-2' 처럼 년도-학기 (term 1·2 정규, 3 여름, 4 겨울) */
@Entity
@Table(name = "semester")
class Semester(
	@Id
	val id: String,

	@JdbcTypeCode(SqlTypes.SMALLINT)
	val year: Int,

	@JdbcTypeCode(SqlTypes.SMALLINT)
	val term: Int,

	/** 종정시 수집 시각 */
	val scrapedAt: OffsetDateTime?,
)
