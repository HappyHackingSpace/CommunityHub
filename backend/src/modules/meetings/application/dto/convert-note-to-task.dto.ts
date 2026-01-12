import { IsUUID, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConvertNoteToTaskDto {
  @ApiProperty({
    description: 'UUID of the user to assign the task to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'assigneeId must be a valid UUID' })
  @IsNotEmpty()
  assigneeId: string;

  @ApiPropertyOptional({
    description: 'Due date for the task (ISO 8601 format)',
    example: '2025-12-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date string' })
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Priority level for the task',
    enum: ['low', 'medium', 'high'],
    example: 'high',
  })
  @IsEnum(['low', 'medium', 'high'], { message: 'Priority must be one of: low, medium, high' })
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';
}
