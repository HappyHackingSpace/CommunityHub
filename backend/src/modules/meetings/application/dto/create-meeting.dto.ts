import { IsString, IsOptional, IsDateString, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsDateString()
  startTime: string;

  @IsNumber()
  @Min(15)
  @Max(480)
  duration: number;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsString({ each: true })
  participantIds?: string[];
}