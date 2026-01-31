import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SemesterDto {
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'year는 숫자여야 합니다.' })
  year: number;

  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'term은 숫자여야 합니다.' })
  term: number;
}
