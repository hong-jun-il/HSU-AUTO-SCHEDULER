import { OfflineScheduleWithIdDto } from 'src/common/dto/offline_schedule.dto';
import { DayOrNightEnum } from 'src/common/enums/day_or_night.enum';
import { DeliveryMethodEnum } from 'src/common/enums/delivery_method.enum';
import { RequirementTypeEnum } from 'src/common/enums/requirement_type.enum';

export class CourseViewDto {
  id: string;
  course_id: string;
  code: string;
  name: string;
  credit: number;
  requirement_types: RequirementTypeEnum[];
  grades: number[];
  grade_limits: number[];
  section: string;
  delivery_method: DeliveryMethodEnum;
  day_or_night: DayOrNightEnum;
  professors: string;
  online_hour: number;
  plan_code: string | null;
  remark: string | null;
  offline_schedules: OfflineScheduleWithIdDto[];
}
