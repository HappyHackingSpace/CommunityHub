import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ReportReason } from '../../domain/enums/report-reason.enum';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @IsOptional()
  @IsString()
  targetContentId?: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsString()
  @MinLength(10)
  description: string;
}
