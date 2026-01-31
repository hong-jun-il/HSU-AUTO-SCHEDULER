import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DayOrNightEnum } from 'src/common/enums/day_or_night.enum';
import { WeekdayEnum } from 'src/common/enums/weekday.enum';
import { PersonalScheduleDto } from './personalSchedule.dto';
import { CourseViewDto } from './course-view.dto';

export class CPSATFilterDto {
  @IsString()
  @IsNotEmpty()
  semester_id: string;

  @IsString()
  @IsNotEmpty()
  major_id: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'grade는 숫자여야 합니다.' })
  grade: number;

  @IsEnum(DayOrNightEnum, {
    message: '유효한 주야 구분이 필요합니다',
  })
  day_or_night: DayOrNightEnum;

  @IsArray()
  @IsEnum(WeekdayEnum, { each: true })
  no_class_days: WeekdayEnum[];

  @IsBoolean()
  has_lunch_break: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalScheduleDto)
  personal_schedules: PersonalScheduleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseViewDto)
  selected_courses: CourseViewDto[];
}
