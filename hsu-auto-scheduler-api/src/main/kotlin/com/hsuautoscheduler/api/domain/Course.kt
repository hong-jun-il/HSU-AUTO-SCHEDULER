package com.hsuautoscheduler.api.domain

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

/**
 * 과목. 여러 학기에 걸쳐 "같은 과목"인지 판단하는 기준이다.
 * 화면에 보이는 이름·학점은 학기별 분반(Lecture)에 있다.
 */
@Entity
@Table(name = "course")
class Course(
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long = 0,

	/** 과목코드 (예: P010182) */
	val code: String,

	/** 대표 이름: 분반들 중 가장 많이 쓰인 이름 */
	val name: String,
)
