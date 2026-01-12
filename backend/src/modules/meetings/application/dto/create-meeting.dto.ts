import { IsString, IsOptional, IsDateString, IsNumber, MinLength, MaxLength, Min, Max, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({
    description: 'Title of the meeting',
    minLength: 3,
    maxLength: 200,
    example: 'Q4 Planning Meeting',
  })
  @IsString()
  @MinLength(3, { message: 'Meeting title must be at least 3 characters' })
  @MaxLength(200, { message: 'Meeting title cannot exceed 200 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the meeting',
    maxLength: 1000,
    example: 'Q4 planning and roadmap discussion',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Start time in ISO 8601 format',
    type: 'string',
    format: 'date-time',
    example: '2024-12-20T14:00:00Z',
  })
  @IsDateString({}, { message: 'startTime must be a valid ISO 8601 date string' })
  startTime: string;

  @ApiProperty({
    description: 'Duration of the meeting in minutes',
    minimum: 15,
    maximum: 480,
    example: 60,
  })
  @IsNumber()
  @Min(15, { message: 'Meeting duration must be at least 15 minutes' })
  @Max(480, { message: 'Meeting duration cannot exceed 480 minutes (8 hours)' })
  duration: number;

  @ApiPropertyOptional({
    description: 'URL for the meeting (e.g., Zoom, Teams link)',
    example: 'https://zoom.us/j/123456789',
  })
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiPropertyOptional({
    description: 'Array of participant UUIDs to invite',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each participantId must be a valid UUID' })
  participantIds?: string[];
}