// src/modules/notifications/presentation/controllers/notification-preferences.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { NotificationPreferenceService } from '../../application/services/notification-preference.service';
import {
  PreferenceResponseDto,
  UpdateChannelPreferenceDto,
  UpdateDndScheduleDto,
} from '../../application/dto';

@ApiTags('notification-preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notification preferences' })
  async getUserPreferences(
    @CurrentUser('userId') userId: string,
  ): Promise<PreferenceResponseDto[]> {
    const preferences = await this.preferenceService.getUserPreferences(userId);

    return preferences.map((p) => ({
      id: p.id,
      userId: p.userId,
      notificationType: p.notificationType,
      channelPreferences: p.channelPreferences,
      digestFrequency: p.digestFrequency,
      doNotDisturb: p.doNotDisturb,
      bypassDndForCritical: p.bypassDndForCritical,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  @Patch('channel')
  @ApiOperation({ summary: 'Update channel preference' })
  async updateChannelPreference(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateChannelPreferenceDto,
  ): Promise<PreferenceResponseDto> {
    const preference = await this.preferenceService.updateChannelPreference(
      userId,
      dto.notificationType,
      dto.channel,
      dto.enabled,
    );

    return {
      id: preference.id,
      userId: preference.userId,
      notificationType: preference.notificationType,
      channelPreferences: preference.channelPreferences,
      digestFrequency: preference.digestFrequency,
      doNotDisturb: preference.doNotDisturb,
      bypassDndForCritical: preference.bypassDndForCritical,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt,
    };
  }

  @Patch('do-not-disturb')
  @ApiOperation({ summary: 'Update Do Not Disturb schedule' })
  async updateDndSchedule(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateDndScheduleDto,
  ): Promise<{ success: boolean }> {
    await this.preferenceService.updateDoNotDisturb(userId, dto);
    return { success: true };
  }

  @Patch('bypass-critical')
  @ApiOperation({ summary: 'Set bypass DND for critical notifications' })
  async setBypassCritical(
    @CurrentUser('userId') userId: string,
    @Body('bypass') bypass: boolean,
  ): Promise<{ success: boolean }> {
    await this.preferenceService.setBypassDndForCritical(userId, bypass);
    return { success: true };
  }
}
