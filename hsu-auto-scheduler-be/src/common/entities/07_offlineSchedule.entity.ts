import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WeekdayEnum } from '../enums/weekday.enum';
import { LectureEntity } from './06_lecture.entity';

@Entity('offline_schedule')
@Unique('uk_offline_schedule', ['lecture_id', 'day', 'start_time'])
export class OfflineScheduleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'enum', enum: WeekdayEnum })
  day: WeekdayEnum;

  @Column({ type: 'int' })
  start_time: number;

  @Column({ type: 'int' })
  end_time: number;

  @Column({ type: 'varchar', length: 255 })
  place: string;

  @Column({ type: 'bigint', unsigned: true })
  lecture_id: string;

  @ManyToOne(() => LectureEntity, (lecture) => lecture.offline_schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'lecture_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_offline_schedule_lecture_id',
  })
  lecture: LectureEntity;
}
