// src/modules/notifications/application/dto/notification-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from '../../domain/enums';
import { ActionButton } from '../../domain/entities';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationChannel })
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @ApiProperty({ enum: NotificationPriority })
  priority: NotificationPriority;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Object, required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ type: [Object], required: false })
  actionButtons?: ActionButton[];

  @ApiProperty({ required: false })
  readAt?: Date;

  @ApiProperty({ required: false })
  sentAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
