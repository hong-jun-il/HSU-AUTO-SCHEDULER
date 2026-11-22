package com.hsuautoscheduler.be.domain

// DB 에는 이름 그대로(varchar) 저장한다. 허용 값은 V1__init.sql 의 CHECK 와 같아야 한다.

/** 이수구분 */
enum class RequirementType(val label: String) {
	MAJOR_REQUIRED("전필"),
	MAJOR_ELECTIVE("전선"),
	MAJOR_BASIC("전기"),
	GENERAL_REQUIRED("교필"),
	REQUIRED_GENERAL_ELECTIVE("선필교"),
	GENERAL_ELECTIVE("일교"),
	FREE_ELECTIVE("일선"),
	MD_MAJOR_ELECTIVE("MD전선"),
	DOUBLE_MAJOR_ELECTIVE("복전선"),
}

/** 수업방식 */
enum class DeliveryMethod(val label: String) {
	FACE_TO_FACE("대면수업"),
	ONLINE("온라인100%"),
	BLENDED("BL"),
}

/** 주야 */
enum class DayOrNight(val label: String) {
	DAY("주"),
	NIGHT("야"),
	BOTH("합"),
}

/** 요일. DB 는 문자열이라 정렬이 알파벳순이 된다 — 요일 순서가 필요하면 ordinal 로 정렬한다 */
enum class Weekday(val label: String) {
	MON("월"),
	TUE("화"),
	WED("수"),
	THU("목"),
	FRI("금"),
	SAT("토"),
	SUN("일"),
}
