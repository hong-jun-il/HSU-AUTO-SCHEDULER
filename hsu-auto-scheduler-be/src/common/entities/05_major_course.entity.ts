import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { RequirementTypeEnum } from '../enums/requirement_type.enum';
import { MajorEntity } from './02_major.entity';
import { CourseEntity } from './04_course.entity';

@Entity('major_course')
@Unique('uk_major_course', ['major_id', 'course_id'])
export class MajorCourseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'enum', enum: RequirementTypeEnum })
  requirement_type: RequirementTypeEnum;

  @Column({ type: 'int' })
  grade: number;

  @Column({ type: 'int', nullable: true })
  grade_limit: number | null;

  @Column({ type: 'bigint', unsigned: true })
  major_id: string;

  @Column({ type: 'bigint', unsigned: true })
  course_id: string;

  @ManyToOne(() => MajorEntity, (major) => major.major_course, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'major_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_major_course_major_id',
  })
  major: MajorEntity;

  @ManyToOne(() => CourseEntity, (course) => course.major_course, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_major_course_course_id',
  })
  course: CourseEntity;
}
