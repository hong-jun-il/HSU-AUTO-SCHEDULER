package com.hsuautoscheduler.be.ingest

import com.hsuautoscheduler.be.domain.DayOrNight
import com.hsuautoscheduler.be.domain.DeliveryMethod
import com.hsuautoscheduler.be.domain.RequirementType
import kotlin.math.roundToInt

/**
 * 요청(전공별 분반 목록)을 테이블 단위로 합친 결과.
 * 합치는 중에 같은 분반·같은 전공-과목의 값이 전공마다 다르면 [IngestConflictException] 을 던진다.
 */
data class SemesterSnapshot(
	val majors: List<MajorRow>,
	val courses: List<CourseRow>,
	val lectures: List<LectureRow>,
	val majorCourses: List<MajorCourseRow>,
) {
	data class MajorRow(val code: String, val name: String)

	data class CourseRow(val code: String, val name: String)

	data class LectureRow(
		val courseCode: String,
		val section: String,
		val name: String,
		val credit: Int,
		val deliveryMethod: DeliveryMethod,
		val dayOrNight: DayOrNight,
		val professors: String,
		val onlineMinutes: Int,
		val gradeLimit: Int?,
		val planCode: String?,
		val remark: String?,
		val classroomRaw: String,
		val schedules: Set<ScheduleRow>,
	)

	data class ScheduleRow(val day: String, val startTime: Int, val endTime: Int, val place: String)

	data class MajorCourseRow(
		val majorCode: String,
		val courseCode: String,
		val requirementType: RequirementType,
		val grade: Int,
	)

	companion object {
		fun from(request: SemesterIngestRequest): SemesterSnapshot {
			val conflicts = mutableListOf<String>()

			val majors = request.majors.associate { it.code.trim() to MajorRow(it.code.trim(), it.name.trim()) }
			if (majors.size != request.majors.size) conflicts += "같은 전공코드가 두 번 나옴"

			val lectures = linkedMapOf<Pair<String, String>, LectureRow>()
			val majorCourses = linkedMapOf<Pair<String, String>, MajorCourseRow>()
			val namesByCode = linkedMapOf<String, MutableList<String>>()

			for (major in request.majors) {
				for (row in major.courses) {
					val code = row.code.trim()
					val section = row.section.trim()

					row.offlineSchedules.filter { it.startTime >= it.endTime }.forEach {
						conflicts += "[$code-$section] 시작(${it.startTime})이 끝(${it.endTime})보다 늦음"
					}

					val lecture = row.toLectureRow(code, section)
					val existing = lectures.putIfAbsent(code to section, lecture)
					if (existing == null) {
						namesByCode.getOrPut(code) { mutableListOf() } += lecture.name
					} else if (existing != lecture) {
						conflicts += "[$code-$section] 전공 ${major.code} 의 분반 정보가 다른 전공과 다름"
					}

					val majorCourse = MajorCourseRow(major.code.trim(), code, row.requirementType, row.grade)
					val existingMc = majorCourses.putIfAbsent(major.code.trim() to code, majorCourse)
					if (existingMc != null && existingMc != majorCourse) {
						conflicts += "[${major.code} $code] 분반마다 이수구분·학년이 다름"
					}
				}
			}

			if (conflicts.isNotEmpty()) throw IngestConflictException(conflicts)

			// 대표 이름: 분반들 중 가장 많이 쓰인 이름, 같으면 짧은 쪽 ("…(상상더학기)" 가 대표가 되지 않게)
			val courses = namesByCode.map { (code, names) ->
				val name = names.groupingBy { it }.eachCount().entries
					.sortedWith(compareByDescending<Map.Entry<String, Int>> { it.value }.thenBy { it.key.length })
					.first().key
				CourseRow(code, name)
			}

			return SemesterSnapshot(majors.values.toList(), courses, lectures.values.toList(), majorCourses.values.toList())
		}

		private fun CoursePayload.toLectureRow(code: String, section: String) = LectureRow(
			courseCode = code,
			section = section,
			name = name.trim(),
			credit = credit,
			deliveryMethod = deliveryMethod,
			dayOrNight = dayOrNight,
			professors = professors.trim(),
			onlineMinutes = (onlineHour * 60).roundToInt(),
			gradeLimit = gradeLimit,
			planCode = planCode?.trim()?.ifEmpty { null },
			remark = remark?.trim()?.ifEmpty { null },
			classroomRaw = classroomRaw ?: "",
			schedules = offlineSchedules.map { ScheduleRow(it.day.name, it.startTime, it.endTime, it.place.trim()) }.toSet(),
		)
	}
}

class IngestConflictException(val conflicts: List<String>) :
	RuntimeException("저장하지 않았습니다. 데이터 충돌 ${conflicts.size}건: ${conflicts.take(5).joinToString("; ")}")
