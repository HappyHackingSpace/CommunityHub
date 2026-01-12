import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RateLimitTier } from '../../domain/enums/rate-limit-tier.enum';

@Injectable()
export class ApiKeyThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: any): Promise<string> {
    if (req.user?.authType === 'api-key') {
      return req.user.apiKeyId;
    }
    return this.getClientIp(req);
  }

  protected getClientIp(req: any): string {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  protected getApiKeyRateLimit(
    tier: RateLimitTier,
  ): { limit: number; ttl: number } {
    switch (tier) {
      case RateLimitTier.FREE:
        return { limit: 100, ttl: 3600000 };
      case RateLimitTier.PREMIUM:
        return { limit: 1000, ttl: 3600000 };
      case RateLimitTier.ENTERPRISE:
        return { limit: 10000, ttl: 3600000 };
      default:
        return { limit: 100, ttl: 3600000 };
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.user?.authType === 'api-key') {
      const tier = request.user.rateLimitTier || RateLimitTier.FREE;
      const rateLimit = this.getApiKeyRateLimit(tier);

      request.rateLimit = rateLimit;
    }

    return super.canActivate(context);
  }
}
