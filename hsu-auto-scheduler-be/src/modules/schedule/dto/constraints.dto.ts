import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ConstraintsDto {
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: '최대 학점은 숫자여야 합니다.' })
  max_credit: number;

  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    { message: '전공 기초 학점은 숫자여야 합니다.' },
  )
  major_basic: number;

  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    { message: '전공 필수 학점은 숫자여야 합니다.' },
  )
  major_required: number;

  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    { message: '전공 선택 학점은 숫자여야 합니다.' },
  )
  major_elective: number;

  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    { message: '하루 최대 강의 개수는 숫자여야 합니다.' },
  )
  daily_lecture_limit: number;
}
