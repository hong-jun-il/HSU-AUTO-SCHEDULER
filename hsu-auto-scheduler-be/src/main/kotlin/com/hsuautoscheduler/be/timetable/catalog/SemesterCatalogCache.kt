package com.hsuautoscheduler.be.timetable.catalog

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.hsuautoscheduler.be.ingest.SemesterReplacedEvent
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener
import java.time.Duration

/**
 * 학기별 SemesterCatalog 캐시. 학기 데이터는 다시 수집하기 전까지 바뀌지 않으므로 오래 둔다.
 * 학기 저장이 커밋되면 그 학기만 비운다.
 */
@Component
class SemesterCatalogCache(private val loader: SemesterCatalogLoader) {
	private val cache: Cache<String, SemesterCatalog> = Caffeine.newBuilder()
		.maximumSize(8)
		.expireAfterAccess(Duration.ofHours(12))
		.build()

	fun get(semesterId: String): SemesterCatalog = cache.get(semesterId, loader::load)

	@TransactionalEventListener
	fun onSemesterReplaced(event: SemesterReplacedEvent) {
		cache.invalidate(event.semesterId)
	}
}
