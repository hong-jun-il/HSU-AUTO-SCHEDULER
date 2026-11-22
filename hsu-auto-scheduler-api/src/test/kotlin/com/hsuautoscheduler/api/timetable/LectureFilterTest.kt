package com.hsuautoscheduler.api.timetable

import com.hsuautoscheduler.api.domain.DayOrNight
import com.hsuautoscheduler.api.domain.DeliveryMethod
import com.hsuautoscheduler.api.domain.RequirementType
import com.hsuautoscheduler.api.domain.Weekday
import com.hsuautoscheduler.api.domain.Weekday.MON
import com.hsuautoscheduler.api.domain.Weekday.TUE
import com.hsuautoscheduler.api.domain.Weekday.WED
import com.hsuautoscheduler.api.timetable.catalog.CatalogLecture
import com.hsuautoscheduler.api.timetable.catalog.CatalogSchedule
import com.hsuautoscheduler.api.timetable.catalog.Offering
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LectureFilterTest {
	private var nextId = 1L

	private fun lecture(
		code: String,
		section: String = "A",
		courseId: Long = code.hashCode().toLong(),
		dayOrNight: DayOrNight = DayOrNight.DAY,
		professors: String = "홍길동",
		times: List<Triple<Weekday, Int, Int>> = emptyList(),
		offerings: List<Offering> = listOf(Offering(1, RequirementType.MAJOR_ELECTIVE, 2)),
	) = CatalogLecture(
		id = nextId++, courseId = courseId, code = code, section = section, name = "과목$code", credit = 3,
		deliveryMethod = DeliveryMethod.FACE_TO_FACE, dayOrNight = dayOrNight, professors = professors,
		onlineMinutes = 0, gradeLimit = null, planCode = null, remark = null,
		schedules = times.map { (d, s, e) -> CatalogSchedule(nextId++, d, s, e, "상상관101") },
		offerings = offerings,
	)

	private fun codes(result: List<CatalogLecture>) = result.map { "${it.code}-${it.section}" }

	@Test
	fun `공강 요일에 수업이 하나라도 있으면 분반을 통째로 뺀다`() {
		val monWed = lecture("A", times = listOf(Triple(MON, 540, 630), Triple(WED, 540, 630)))
		val tue = lecture("B", times = listOf(Triple(TUE, 540, 630)))
		val online = lecture("C")

		val result = LectureFilter.apply(listOf(monWed, tue, online), LectureConditions(noClassDays = setOf(MON)))

		assertThat(codes(result)).containsExactly("B-A", "C-A")
	}

	@Test
	fun `전공을 고르면 그 전공의 학년으로만 거른다 — 전학년(0)은 항상 포함`() {
		val l = lecture(
			"A",
			offerings = listOf(Offering(1, RequirementType.MAJOR_REQUIRED, 2), Offering(2, RequirementType.MAJOR_ELECTIVE, 3)),
		)
		val allGrades = lecture("B", offerings = listOf(Offering(1, RequirementType.GENERAL_REQUIRED, 0)))
		val otherMajor = lecture("C", offerings = listOf(Offering(2, RequirementType.MAJOR_ELECTIVE, 2)))
		val all = listOf(l, allGrades, otherMajor)

		assertThat(codes(LectureFilter.apply(all, LectureConditions(majorId = 1, grade = 3)))).containsExactly("B-A")
		assertThat(codes(LectureFilter.apply(all, LectureConditions(majorId = 2, grade = 3)))).containsExactly("A-A")
		// 전공을 안 고르면 어느 전공이든 그 학년이면 된다
		assertThat(codes(LectureFilter.apply(all, LectureConditions(grade = 3)))).containsExactly("A-A", "B-A")
		assertThat(codes(LectureFilter.apply(all, LectureConditions(majorId = 1)))).containsExactly("A-A", "B-A")
	}

	@Test
	fun `주야는 고른 값이거나 BOTH 인 분반만`() {
		val all = listOf(
			lecture("D", dayOrNight = DayOrNight.DAY),
			lecture("N", dayOrNight = DayOrNight.NIGHT),
			lecture("B", dayOrNight = DayOrNight.BOTH),
		)
		assertThat(codes(LectureFilter.apply(all, LectureConditions(dayOrNight = DayOrNight.NIGHT)))).containsExactly("N-A", "B-A")
	}

	@Test
	fun `고른 분반과 같은 과목의 다른 분반, 시간이 겹치는 분반을 뺀다 — 끝과 시작이 닿는 것은 겹침이 아니다`() {
		val picked = lecture("A", section = "A", courseId = 10, times = listOf(Triple(MON, 540, 630)))
		val sameCourse = lecture("A", section = "B", courseId = 10, times = listOf(Triple(TUE, 540, 630)))
		val overlapping = lecture("B", courseId = 20, times = listOf(Triple(MON, 600, 690)))
		val touching = lecture("C", courseId = 30, times = listOf(Triple(MON, 630, 720)))
		val otherDay = lecture("D", courseId = 40, times = listOf(Triple(TUE, 540, 630)))

		val result = LectureFilter.apply(
			listOf(picked, sameCourse, overlapping, touching, otherDay),
			LectureConditions(selected = listOf(picked)),
		)

		assertThat(codes(result)).containsExactly("C-A", "D-A")
	}

	@Test
	fun `개인 일정과 점심시간에 겹치는 분반을 뺀다`() {
		val evening = lecture("A", times = listOf(Triple(TUE, 1080, 1170)))
		val lunch = lecture("B", times = listOf(Triple(WED, 690, 750)))
		val morning = lecture("C", times = listOf(Triple(WED, 540, 630)))

		val result = LectureFilter.apply(
			listOf(evening, lunch, morning),
			LectureConditions(busyTimes = listOf(TimeBlock(TUE, 1080, 1260)), hasLunchBreak = true),
		)

		assertThat(codes(result)).containsExactly("C-A")
	}

	@Test
	fun `검색어는 과목코드·과목명·교수를 대소문자 없이 찾는다`() {
		val l = lecture("P010182", professors = "Kim,박종언")
		assertThat(LectureFilter.matchesSearch(l, "p0101")).isTrue()
		assertThat(LectureFilter.matchesSearch(l, "과목P")).isTrue()
		assertThat(LectureFilter.matchesSearch(l, "kim")).isTrue()
		assertThat(LectureFilter.matchesSearch(l, "  ")).isTrue()
		assertThat(LectureFilter.matchesSearch(l, "없는말")).isFalse()
	}
}
