import { IsString, IsOptional, IsDateString, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeetingDto {
  @ApiPropertyOptional({
    description: 'Title of the meeting',
    minLength: 3,
    maxLength: 200,
    example: 'Updated Meeting Title',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Meeting title must be at least 3 characters' })
  @MaxLength(200, { message: 'Meeting title cannot exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the meeting',
    maxLength: 1000,
    example: 'Updated meeting description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Start time in ISO 8601 format',
    type: 'string',
    format: 'date-time',
    example: '2024-12-20T14:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'startTime must be a valid ISO 8601 date string' })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Duration of the meeting in minutes',
    minimum: 15,
    maximum: 480,
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(15, { message: 'Meeting duration must be at least 15 minutes' })
  @Max(480, { message: 'Meeting duration cannot exceed 480 minutes (8 hours)' })
  duration?: number;

  @ApiPropertyOptional({
    description: 'URL for the meeting (e.g., Zoom, Teams link)',
    example: 'https://zoom.us/j/123456789',
  })
  @IsOptional()
  @IsString()
  meetingUrl?: string;
}