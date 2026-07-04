import { IsString, MinLength, IsArray, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { RateLimitTier } from '../../domain/enums/rate-limit-tier.enum';
import { ApiKeyScope } from '../../domain/enums/api-key-scope.enum';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsArray()
  @IsEnum(ApiKeyScope, { each: true })
  scopes: string[];

  @IsEnum(RateLimitTier)
  @IsOptional()
  rateLimitTier?: RateLimitTier;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsNumber()
  @IsOptional()
  tenantId?: number;
}
