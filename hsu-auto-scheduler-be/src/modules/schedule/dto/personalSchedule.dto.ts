import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { OfflineScheduleWithIdDto } from 'src/common/dto/offline_schedule.dto';

class PersnalOfflineScheduleDto extends OmitType(OfflineScheduleWithIdDto, [
  'lecture_id',
  'place',
]) {
  @IsString()
  place: string;
}

export class PersonalScheduleDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  personal_schedule_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersnalOfflineScheduleDto)
  offline_schedules: PersnalOfflineScheduleDto[];
}
