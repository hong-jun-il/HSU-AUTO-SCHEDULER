package com.hsuautoscheduler.api.domain

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

/** 전공. 종정시 전공코드(예: P012) 기준이고 학기와 상관없이 공유한다 */
@Entity
@Table(name = "major")
class Major(
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long = 0,

	val code: String,

	/** 가장 최근 학기의 이름 */
	val name: String,
)
