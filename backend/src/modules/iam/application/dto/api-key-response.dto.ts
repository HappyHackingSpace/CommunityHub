import { ApiKeyStatus } from '../../domain/enums/api-key-status.enum';
import { RateLimitTier } from '../../domain/enums/rate-limit-tier.enum';

export class ApiKeyResponseDto {
  id: string;
  name: string;
  key: string;
  secret?: string; 
  userId: string;
  tenantId: string;
  scopes: string[];
  rateLimitTier: RateLimitTier;
  expiresAt?: Date;
  lastUsedAt?: Date;
  status: ApiKeyStatus;
  createdAt: Date;
  updatedAt: Date;
}
