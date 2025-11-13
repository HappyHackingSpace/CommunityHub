import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConvertNoteToTaskDto {
  @ApiProperty({
    description: 'User ID to assign the task to',
    example: 'user_456def',
  })
  @IsString()
  @IsNotEmpty()
  assigneeId: string;

  @ApiPropertyOptional({
    description: 'Due date for the task (ISO 8601 format)',
    example: '2025-12-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Priority level for the task',
    enum: ['low', 'medium', 'high'],
    example: 'high',
  })
  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';
}
