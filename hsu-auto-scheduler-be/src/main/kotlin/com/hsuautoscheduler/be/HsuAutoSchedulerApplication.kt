package com.hsuautoscheduler.be

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class HsuAutoSchedulerApplication

fun main(args: Array<String>) {
	runApplication<HsuAutoSchedulerApplication>(*args)
}
