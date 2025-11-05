// src/modules/notifications/application/dto/preference-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationType,
  DigestFrequency,
} from '../../domain/enums';
import type { ChannelPreference, DoNotDisturbSchedule } from '../../domain/entities';

export class PreferenceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  notificationType: NotificationType;

  @ApiProperty({ type: [Object], description: 'Channel preferences array' })
  channelPreferences: ChannelPreference[];

  @ApiProperty({ enum: DigestFrequency })
  digestFrequency: DigestFrequency;

  @ApiProperty({ type: Object, description: 'Do not disturb schedule' })
  doNotDisturb: DoNotDisturbSchedule;

  @ApiProperty()
  bypassDndForCritical: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
