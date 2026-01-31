import { IsNotEmpty, IsString } from 'class-validator';

export class MajorDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
