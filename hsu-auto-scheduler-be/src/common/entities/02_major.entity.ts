import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MajorCourseEntity } from './05_major_course.entity';
import { SemesterMajorEntity } from './03_semester_major.entity';

@Entity('major')
@Unique('uk_major_code', ['code'])
export class MajorEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => SemesterMajorEntity, (sm) => sm.semester)
  semester_major: SemesterMajorEntity[];

  @OneToMany(() => MajorCourseEntity, (mc) => mc.major)
  major_course: MajorCourseEntity[];
}
