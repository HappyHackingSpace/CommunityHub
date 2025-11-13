import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RsvpStatus } from '../../domain/enums/rsvp-status.enum';

export class SubmitRsvpDto {
  @ApiProperty({
    description: 'RSVP status',
    enum: RsvpStatus,
    example: RsvpStatus.GOING,
  })
  @IsEnum(RsvpStatus)
  status: RsvpStatus;

  @ApiPropertyOptional({
    description: 'Optional notes or message with the RSVP',
    example: 'Looking forward to the meeting!',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
