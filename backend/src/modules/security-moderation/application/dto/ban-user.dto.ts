import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ModerationAction } from '../../domain/enums/moderation-action.enum';

export class BanUserDto {
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @IsString()
  reason: string;

  @IsOptional()
  @IsDateString()
  banUntil?: string;
}
