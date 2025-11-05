// src/modules/notifications/application/dto/update-channel-preference.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean } from 'class-validator';
import { NotificationType, NotificationChannel } from '../../domain/enums';

export class UpdateChannelPreferenceDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}
