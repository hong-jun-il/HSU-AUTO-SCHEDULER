import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  OfflineScheduleDto,
  OfflineScheduleWithIdDto,
} from 'src/common/dto/offline_schedule.dto';
import { DayOrNightEnum } from 'src/common/enums/day_or_night.enum';
import { DeliveryMethodEnum } from 'src/common/enums/delivery_method.enum';
import { RequirementTypeEnum } from 'src/common/enums/requirement_type.enum';

export class CourseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: '학점은 숫자여야 합니다' })
  credit: number;

  @IsEnum(RequirementTypeEnum)
  requirement_type: RequirementTypeEnum;

  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: '학년은 숫자여야 합니다' })
  grade: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: '학년 제한은 숫자여야 합니다' })
  grade_limit: number | null;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsEnum(DeliveryMethodEnum)
  delivery_method: DeliveryMethodEnum;

  @IsEnum(DayOrNightEnum)
  day_or_night: DayOrNightEnum;

  @IsString()
  @IsNotEmpty()
  professors: string;

  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    { message: '온라인 수강 시간은 숫자여야 합니다' },
  )
  online_hour: number;

  @IsOptional()
  @IsString()
  plan_code: string | null;

  @IsOptional()
  @IsString()
  remark: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineScheduleDto)
  offline_schedules: OfflineScheduleDto[];
}

export class CourseWithIdDto extends OmitType(CourseDto, [
  'offline_schedules',
]) {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineScheduleWithIdDto)
  offline_schedules: OfflineScheduleWithIdDto[];
}
