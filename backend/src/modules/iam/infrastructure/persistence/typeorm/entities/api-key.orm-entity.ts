import { ApiKeyStatus } from 'src/modules/iam/domain/enums/api-key-status.enum';
import { RateLimitTier } from 'src/modules/iam/domain/enums/rate-limit-tier.enum';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('api_keys')
@Index(['key'], { unique: true })
@Index(['userId'])
@Index(['tenantId'])
@Index(['status'])
export class ApiKeyOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  key: string;

  @Column({ name: 'secret_hash' })
  secretHash: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'tenant_id', type: 'bigint' })
  tenantId: number;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  scopes: string[];

  @Column({
    name: 'rate_limit_tier',
    type: 'enum',
    enum: RateLimitTier,
    default: RateLimitTier.FREE,
  })
  rateLimitTier: RateLimitTier;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
  lastUsedAt?: Date;

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE,
  })
  status: ApiKeyStatus;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserOrmEntity;
}
