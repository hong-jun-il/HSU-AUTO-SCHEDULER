import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { LectureEntity } from './06_lecture.entity';
import { SemesterMajorEntity } from './03_semester_major.entity';

@Entity('semester')
@Unique('uk_semester', ['year', 'term'])
export class SemesterEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'tinyint' })
  term: number;

  @OneToMany(() => SemesterMajorEntity, (sm) => sm.semester)
  majors: SemesterMajorEntity[];

  @OneToMany(() => LectureEntity, (lecture) => lecture.semester)
  lectures: LectureEntity[];
}
