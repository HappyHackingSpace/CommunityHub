import { IsString, IsOptional, IsDateString, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';

export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  duration?: number;

  @IsOptional()
  @IsString()
  meetingUrl?: string;
}