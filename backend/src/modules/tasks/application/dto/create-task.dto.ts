import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { TaskVisibility } from '../../domain/enums/task-visibility.enum';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TaskVisibility)
  visibility?: TaskVisibility;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
