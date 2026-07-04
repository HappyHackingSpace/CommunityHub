// src/modules/notifications/infrastructure/persistence/notification-preference.schema.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { NotificationType, DigestFrequency } from '../../domain/enums';
import type { ChannelPreference, DoNotDisturbSchedule } from '../../domain/entities';

@Entity('notification_preferences')
@Unique(['tenantId', 'userId', 'notificationType'])
@Index(['tenantId'])
@Index(['tenantId', 'userId'])
export class NotificationPreferenceSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({ type: 'jsonb' })
  channelPreferences: ChannelPreference[];

  @Column({
    type: 'enum',
    enum: DigestFrequency,
    default: DigestFrequency.DISABLED,
  })
  digestFrequency: DigestFrequency;

  @Column({
    type: 'jsonb',
    default: { enabled: false, startTime: '22:00', endTime: '09:00' },
  })
  doNotDisturb: DoNotDisturbSchedule;

  @Column({ type: 'boolean', default: true })
  bypassDndForCritical: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
