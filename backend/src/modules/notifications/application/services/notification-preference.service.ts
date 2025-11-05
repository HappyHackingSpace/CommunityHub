// src/modules/notifications/application/services/notification-preference.service.ts
import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { INotificationPreferenceRepository } from '../../domain/repositories';
import {
  NotificationPreference,
  DoNotDisturbSchedule,
  ChannelPreference,
} from '../../domain/entities';
import {
  NotificationType,
  NotificationChannel,
  DigestFrequency,
} from '../../domain/enums';

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor(
    @Inject('INotificationPreferenceRepository')
    private readonly preferenceRepository: INotificationPreferenceRepository,
  ) {}

  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    const preferences = await this.preferenceRepository.findByUserId(userId);

    // If no preferences exist, create default ones
    if (preferences.length === 0) {
      return this.preferenceRepository.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updateChannelPreference(
    userId: string,
    notificationType: NotificationType,
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findByUserIdAndType(
      userId,
      notificationType,
    );

    if (!preference) {
      // Create new preference
      preference = new NotificationPreference(
        uuidv4(),
        userId,
        notificationType,
        [{ channel, enabled }],
      );
    } else {
      preference.updateChannelPreference(channel, enabled);
    }

    return this.preferenceRepository.save(preference);
  }

  async updateDigestFrequency(
    userId: string,
    notificationType: NotificationType,
    frequency: DigestFrequency,
  ): Promise<NotificationPreference> {
    const preference = await this.preferenceRepository.findByUserIdAndType(
      userId,
      notificationType,
    );

    if (!preference) {
      throw new NotFoundException(
        `Preference not found for user ${userId} and type ${notificationType}`,
      );
    }

    preference.setDigestFrequency(frequency);
    return this.preferenceRepository.save(preference);
  }

  async updateDoNotDisturb(
    userId: string,
    schedule: DoNotDisturbSchedule,
  ): Promise<void> {
    const preferences = await this.preferenceRepository.findByUserId(userId);

    // Update DND for all preferences
    await Promise.all(
      preferences.map(async (pref) => {
        pref.updateDoNotDisturb(schedule);
        return this.preferenceRepository.save(pref);
      }),
    );

    this.logger.log(`Updated Do Not Disturb schedule for user ${userId}`);
  }

  async setBypassDndForCritical(
    userId: string,
    bypass: boolean,
  ): Promise<void> {
    const preferences = await this.preferenceRepository.findByUserId(userId);

    await Promise.all(
      preferences.map(async (pref) => {
        pref.setBypassDndForCritical(bypass);
        return this.preferenceRepository.save(pref);
      }),
    );

    this.logger.log(
      `Set bypass DND for critical to ${bypass} for user ${userId}`,
    );
  }

  async bulkUpdateChannelPreferences(
    userId: string,
    updates: Array<{
      notificationType: NotificationType;
      channelPreferences: ChannelPreference[];
    }>,
  ): Promise<NotificationPreference[]> {
    const results: NotificationPreference[] = [];

    for (const update of updates) {
      let preference = await this.preferenceRepository.findByUserIdAndType(
        userId,
        update.notificationType,
      );

      if (!preference) {
        preference = new NotificationPreference(
          uuidv4(),
          userId,
          update.notificationType,
          update.channelPreferences,
        );
      } else {
        // Update each channel
        for (const channelPref of update.channelPreferences) {
          preference.updateChannelPreference(
            channelPref.channel,
            channelPref.enabled,
          );
        }
      }

      const saved = await this.preferenceRepository.save(preference);
      results.push(saved);
    }

    return results;
  }
}
