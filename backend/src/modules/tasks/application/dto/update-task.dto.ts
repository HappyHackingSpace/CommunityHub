import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TaskVisibility } from '../../domain/enums/task-visibility.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TaskVisibility)
  visibility?: TaskVisibility;
}
