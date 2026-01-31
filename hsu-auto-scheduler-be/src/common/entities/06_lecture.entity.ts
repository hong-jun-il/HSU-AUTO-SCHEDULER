import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DayOrNightEnum } from '../enums/day_or_night.enum';
import { DeliveryMethodEnum } from '../enums/delivery_method.enum';
import { SemesterEntity } from './01_semester.entity';
import { OfflineScheduleEntity } from './07_offlineSchedule.entity';
import { CourseEntity } from './04_course.entity';

@Entity('lecture')
@Unique('uk_lecture', ['semester_id', 'course_id', 'section'])
export class LectureEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 5 })
  section: string;

  @Column({ type: 'enum', enum: DeliveryMethodEnum })
  delivery_method: DeliveryMethodEnum;

  @Column({
    type: 'enum',
    enum: DayOrNightEnum,
  })
  day_or_night: DayOrNightEnum;

  @Column({ type: 'varchar', length: 255 })
  professors: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
    default: 0.0,
  })
  online_hour: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  plan_code: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ type: 'varchar', length: 20 })
  semester_id: string;

  @Column({ type: 'bigint', unsigned: true })
  course_id: string;

  @ManyToOne(() => SemesterEntity, (semester) => semester.lectures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'semester_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_lecture_semester_id',
  })
  semester: SemesterEntity;

  @ManyToOne(() => CourseEntity, (course) => course.lectures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_lecture_course_id',
  })
  course: CourseEntity;

  @OneToMany(
    () => OfflineScheduleEntity,
    (offline_schedule) => offline_schedule.lecture,
  )
  offline_schedules: OfflineScheduleEntity[];
}
