import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiKeyOrmEntity } from './api-key.orm-entity';

@Entity('api_key_usage_logs')
@Index(['apiKeyId'])
@Index(['createdAt'])
export class ApiKeyUsageLogOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'api_key_id' })
  apiKeyId: string;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'response_time_ms', type: 'int', nullable: true })
  responseTimeMs?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ApiKeyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey?: ApiKeyOrmEntity;
}
