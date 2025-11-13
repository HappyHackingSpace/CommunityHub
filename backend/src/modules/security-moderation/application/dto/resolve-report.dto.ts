import { IsString, MinLength } from 'class-validator';

export class ResolveReportDto {
  @IsString()
  @MinLength(10)
  resolutionNotes: string;
}
