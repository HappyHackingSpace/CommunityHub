import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  IsUUID,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { TaskVisibility } from '../../domain/enums/task-visibility.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ minLength: 3, maxLength: 200 })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ enum: TaskVisibility, required: false })
  @IsOptional()
  @IsEnum(TaskVisibility)
  visibility?: TaskVisibility;

  @ApiProperty({ enum: TaskPriority, required: false, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ required: false, description: 'Estimated time in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedTime?: number;

  @ApiProperty({ required: false, description: 'Points for gamification' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ required: false, description: 'Cron expression for recurring tasks' })
  @IsOptional()
  @IsString()
  recurringSchedule?: string;

  @ApiProperty({ required: false, type: [String], description: 'Skills required for this task' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
