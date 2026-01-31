import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './services/crawler.service';
import { PersistenceService } from './services/persistence.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemesterEntity } from 'src/common/entities/01_semester.entity';
import { MajorEntity } from 'src/common/entities/02_major.entity';
import { SemesterMajorEntity } from 'src/common/entities/03_semester_major.entity';
import { CourseEntity } from 'src/common/entities/04_course.entity';
import { MajorCourseEntity } from 'src/common/entities/05_major_course.entity';
import { LectureEntity } from 'src/common/entities/06_lecture.entity';
import { OfflineScheduleEntity } from 'src/common/entities/07_offlineSchedule.entity';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SemesterEntity,
      MajorEntity,
      SemesterMajorEntity,
      CourseEntity,
      MajorCourseEntity,
      LectureEntity,
      OfflineScheduleEntity,
    ]),
    LoggerModule,
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService, PersistenceService],
})
export class CrawlerModule {}
