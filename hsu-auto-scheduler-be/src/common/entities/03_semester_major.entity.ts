import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SemesterEntity } from './01_semester.entity';
import { MajorEntity } from './02_major.entity';

@Entity('semester_major')
@Unique('uk_semester_major', ['semester_id', 'major_id'])
export class SemesterMajorEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  semester_id: string;

  @Column({ type: 'bigint', unsigned: true })
  major_id: string;

  @ManyToOne(() => SemesterEntity, (semester) => semester.majors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'semester_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_semester_major_semester_id',
  })
  semester: SemesterEntity;

  @ManyToOne(() => MajorEntity, (major) => major.major_course, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'major_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_semester_major_major_id',
  })
  major: MajorEntity;
}
