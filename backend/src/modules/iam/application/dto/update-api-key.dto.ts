import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiKeyStatus } from '../../domain/enums/api-key-status.enum';
import { RateLimitTier } from '../../domain/enums/rate-limit-tier.enum';
import { ApiKeyScope } from '../../domain/enums/api-key-scope.enum';

export class UpdateApiKeyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsEnum(ApiKeyScope, { each: true })
  @IsOptional()
  scopes?: string[];

  @IsEnum(RateLimitTier)
  @IsOptional()
  rateLimitTier?: RateLimitTier;

  @IsEnum(ApiKeyStatus)
  @IsOptional()
  status?: ApiKeyStatus;
}
