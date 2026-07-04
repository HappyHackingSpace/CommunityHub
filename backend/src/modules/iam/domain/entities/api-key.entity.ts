import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ApiKeyStatus } from '../enums/api-key-status.enum';
import { RateLimitTier } from '../enums/rate-limit-tier.enum';

interface ApiKeyProps {
  name: string;
  key: string;
  secretHash: string;
  userId: string;
  tenantId: string;
  scopes: string[];
  rateLimitTier: RateLimitTier;
  expiresAt?: Date;
  lastUsedAt?: Date;
  status: ApiKeyStatus;
  metadata?: Record<string, any>;
}

export class ApiKey extends BaseEntity {
  private props: ApiKeyProps;

  private constructor(
    id: string,
    props: ApiKeyProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get name(): string {
    return this.props.name;
  }

  get key(): string {
    return this.props.key;
  }

  get secretHash(): string {
    return this.props.secretHash;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get scopes(): string[] {
    return [...this.props.scopes];
  }

  get rateLimitTier(): RateLimitTier {
    return this.props.rateLimitTier;
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  get lastUsedAt(): Date | undefined {
    return this.props.lastUsedAt;
  }

  get status(): ApiKeyStatus {
    return this.props.status;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  public isActive(): boolean {
    return this.props.status === ApiKeyStatus.ACTIVE;
  }

  public isExpired(): boolean {
    if (!this.props.expiresAt) {
      return false;
    }
    return new Date() > this.props.expiresAt;
  }

  public canBeUsed(): boolean {
    return this.isActive() && !this.isExpired();
  }

  public hasScope(scope: string): boolean {
    // Wildcard scope gives access to everything
    if (this.props.scopes.includes('*')) {
      return true;
    }
    return this.props.scopes.includes(scope);
  }

  public hasAllScopes(scopes: string[]): boolean {
    return scopes.every(scope => this.hasScope(scope));
  }

  public revoke(): void {
    if (this.props.status === ApiKeyStatus.REVOKED) {
      throw new Error('API key is already revoked');
    }
    this.props.status = ApiKeyStatus.REVOKED;
    this.touch();
  }

  public updateLastUsed(): void {
    this.props.lastUsedAt = new Date();
    this.touch();
  }

  public updateScopes(scopes: string[]): void {
    this.props.scopes = scopes;
    this.touch();
  }

  public updateName(name: string): void {
    this.props.name = name;
    this.touch();
  }

  public updateRateLimitTier(tier: RateLimitTier): void {
    this.props.rateLimitTier = tier;
    this.touch();
  }

  public updateSecretHash(secretHash: string): void {
    this.props.secretHash = secretHash;
    this.touch();
  }

  public static create(props: {
    name: string;
    key: string;
    secretHash: string;
    userId: string;
    tenantId: string;
    scopes: string[];
    rateLimitTier: RateLimitTier;
    expiresAt?: Date;
    status: ApiKeyStatus;
    metadata?: Record<string, any>;
  }): ApiKey {
    const id = this.generateId();

    return new ApiKey(
      id,
      {
        name: props.name,
        key: props.key,
        secretHash: props.secretHash,
        userId: props.userId,
        tenantId: props.tenantId,
        scopes: props.scopes,
        rateLimitTier: props.rateLimitTier,
        expiresAt: props.expiresAt,
        status: props.status,
        metadata: props.metadata,
      },
    );
  }

  public static restore(
    id: string,
    name: string,
    key: string,
    secretHash: string,
    userId: string,
    tenantId: string,
    scopes: string[],
    rateLimitTier: RateLimitTier,
    status: ApiKeyStatus,
    expiresAt?: Date,
    lastUsedAt?: Date,
    metadata?: Record<string, any>,
    createdAt?: Date,
    updatedAt?: Date,
  ): ApiKey {
    return new ApiKey(
      id,
      {
        name,
        key,
        secretHash,
        userId,
        tenantId,
        scopes,
        rateLimitTier,
        expiresAt,
        lastUsedAt,
        status,
        metadata,
      },
      createdAt,
      updatedAt,
    );
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
