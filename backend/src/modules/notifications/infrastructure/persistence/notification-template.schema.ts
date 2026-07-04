// src/modules/notifications/infrastructure/persistence/notification-template.schema.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { NotificationType, NotificationChannel } from '../../domain/enums';

@Entity('notification_templates')
@Unique(['type', 'channel'])
export class NotificationTemplateSchema {
  @PrimaryColumn('uuid')
  id: string;

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

  @Column({ nullable: true })
  subject?: string;

  @Column('text')
  bodyTemplate: string;

  @Column({ type: 'text', nullable: true })
  actionButtonsTemplate?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
