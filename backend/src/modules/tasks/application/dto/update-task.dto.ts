import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskVisibility } from '../../domain/enums/task-visibility.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Title of the task',
    minLength: 3,
    maxLength: 200,
    example: 'Update user documentation',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    maxLength: 2000,
    example: 'Update the user documentation to reflect new features',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Due date in ISO 8601 format',
    type: 'string',
    format: 'date-time',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Task visibility level',
    enum: TaskVisibility,
    example: TaskVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(TaskVisibility)
  visibility?: TaskVisibility;
}
