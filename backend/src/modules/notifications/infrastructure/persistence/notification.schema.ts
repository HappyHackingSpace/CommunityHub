// src/modules/notifications/infrastructure/persistence/notification.schema.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from '../../domain/enums';
import type { ActionButton, NotificationMetadata } from '../../domain/entities';

@Entity('notifications')
@Index(['tenantId'])
@Index(['tenantId', 'userId', 'createdAt'])
@Index(['tenantId', 'status'])
export class NotificationSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('bigint', { name: 'tenant_id' })
  tenantId: number;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: NotificationMetadata;

  @Column({ type: 'jsonb', nullable: true })
  actionButtons?: ActionButton[];

  @Column({ nullable: true })
  @Index()
  groupKey?: string;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
