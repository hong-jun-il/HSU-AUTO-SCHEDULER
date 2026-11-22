package com.hsuautoscheduler.be.ingest

/** 학기 저장 트랜잭션 안에서 발행한다. 듣는 쪽은 @TransactionalEventListener 로 커밋 뒤에 받는다 */
data class SemesterReplacedEvent(val semesterId: String)
