import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateSubTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;
}
