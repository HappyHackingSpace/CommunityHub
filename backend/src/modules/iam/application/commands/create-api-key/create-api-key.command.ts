import { RateLimitTier } from "src/modules/iam/domain/enums/rate-limit-tier.enum";

export class CreateApiKeyCommand {
  constructor(
    public readonly name: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly scopes: string[],
    public readonly rateLimitTier: RateLimitTier,
    public readonly expiresAt?: Date,
  ) {}
}
