import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './services/schedule.service';
import { HttpModule } from '@nestjs/axios';
// import { CourseFilteringQueryService } from './services/CourseFilteringQuery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemesterEntity } from 'src/common/entities/01_semester.entity';
import { MajorEntity } from 'src/common/entities/02_major.entity';
import { CourseEntity } from 'src/common/entities/04_course.entity';
import { OfflineScheduleEntity } from 'src/common/entities/07_offlineSchedule.entity';
import { LectureEntity } from 'src/common/entities/06_lecture.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SemesterEntity,
      MajorEntity,
      CourseEntity,
      LectureEntity,
      OfflineScheduleEntity,
    ]),
    HttpModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
