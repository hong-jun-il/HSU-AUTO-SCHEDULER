import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { WeekdayEnum } from '../enums/weekday.enum';

export class OfflineScheduleDto {
  @IsEnum(WeekdayEnum)
  day: WeekdayEnum;

  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'start_time은 숫자여야 합니다.' })
  start_time: number;

  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'end_time은 숫자여야 합니다.' })
  end_time: number;

  @IsString()
  @IsNotEmpty()
  place: string;
}

export class OfflineScheduleWithIdDto extends OfflineScheduleDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  lecture_id: string;
}
