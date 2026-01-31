import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MajorCourseEntity } from './05_major_course.entity';
import { LectureEntity } from './06_lecture.entity';

@Entity('course')
@Unique('uk_course_code', ['code'])
export class CourseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  credit: number;

  @OneToMany(() => MajorCourseEntity, (mc) => mc.course)
  major_course: MajorCourseEntity[];

  @OneToMany(() => LectureEntity, (lecture) => lecture.course)
  lectures: LectureEntity[];
}
