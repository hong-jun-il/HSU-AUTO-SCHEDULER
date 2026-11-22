package com.hsuautoscheduler.be.timetable.catalog

import com.hsuautoscheduler.be.domain.DayOrNight
import com.hsuautoscheduler.be.domain.DeliveryMethod
import com.hsuautoscheduler.be.domain.RequirementType
import com.hsuautoscheduler.be.domain.Weekday
import java.time.Instant

/**
 * 학기 하나의 조회용 데이터. DB 에서 한 번 읽어 메모리에 두고 강의 조회·시간표 추천이 같이 쓴다.
 * JPA 엔티티가 아닌 불변 객체라 캐시에 두어도 지연 로딩·세션 문제가 없다.
 */
class SemesterCatalog(
	val semesterId: String,
	/** 이 객체를 DB 에서 읽은 시각. 추천 결과 캐시의 키에 들어가서, 학기를 다시 저장하면 예전 결과를 쓰지 않는다 */
	val loadedAt: Instant,
	/** 과목코드, 분반 순 */
	val lectures: List<CatalogLecture>,
) {
	private val byId = lectures.associateBy { it.id }

	fun lecture(id: Long): CatalogLecture? = byId[id]
}

data class CatalogLecture(
	val id: Long,
	val courseId: Long,
	val code: String,
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
	/** 요일, 시작 순 */
	val schedules: List<CatalogSchedule>,
	/** 이 과목을 여는 전공들 (그 학기 major_course) */
	val offerings: List<Offering>,
)

data class CatalogSchedule(val id: Long, val day: Weekday, val startTime: Int, val endTime: Int, val place: String)

data class Offering(val majorId: Long, val requirementType: RequirementType, val grade: Int)
