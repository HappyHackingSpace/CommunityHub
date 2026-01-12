import { RateLimitTier } from "src/modules/iam/domain/enums/rate-limit-tier.enum";

export class CreateApiKeyCommand {
  constructor(
    public readonly name: string,
    public readonly userId: string,
    public readonly tenantId: number,
    public readonly scopes: string[],
    public readonly rateLimitTier: RateLimitTier,
    public readonly expiresAt?: Date,
  ) {}
}
