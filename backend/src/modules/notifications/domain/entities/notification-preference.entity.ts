// src/modules/notifications/domain/entities/notification-preference.entity.ts
import { BaseEntity } from '../../../../shared/domain/base-entity';
import {
  NotificationType,
  NotificationChannel,
  DigestFrequency,
} from '../enums';

export interface DoNotDisturbSchedule {
  enabled: boolean;
  startTime: string; // Format: "HH:mm" (e.g., "22:00")
  endTime: string; // Format: "HH:mm" (e.g., "09:00")
  timezone?: string; // User's timezone
}

export interface ChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
}

export class NotificationPreference extends BaseEntity {
  private _userId: string;
  private _notificationType: NotificationType;
  private _channelPreferences: ChannelPreference[];
  private _digestFrequency: DigestFrequency;
  private _doNotDisturb: DoNotDisturbSchedule;
  private _bypassDndForCritical: boolean;

  constructor(
    id: string,
    userId: string,
    notificationType: NotificationType,
    channelPreferences: ChannelPreference[],
    digestFrequency: DigestFrequency = DigestFrequency.DISABLED,
    doNotDisturb: DoNotDisturbSchedule = {
      enabled: false,
      startTime: '22:00',
      endTime: '09:00',
    },
    bypassDndForCritical: boolean = true,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this._userId = userId;
    this._notificationType = notificationType;
    this._channelPreferences = channelPreferences;
    this._digestFrequency = digestFrequency;
    this._doNotDisturb = doNotDisturb;
    this._bypassDndForCritical = bypassDndForCritical;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get notificationType(): NotificationType {
    return this._notificationType;
  }

  get channelPreferences(): ChannelPreference[] {
    return this._channelPreferences;
  }

  get digestFrequency(): DigestFrequency {
    return this._digestFrequency;
  }

  get doNotDisturb(): DoNotDisturbSchedule {
    return this._doNotDisturb;
  }

  get bypassDndForCritical(): boolean {
    return this._bypassDndForCritical;
  }

  // Business methods
  isChannelEnabled(channel: NotificationChannel): boolean {
    const preference = this._channelPreferences.find(
      (p) => p.channel === channel,
    );
    return preference?.enabled ?? false;
  }

  updateChannelPreference(
    channel: NotificationChannel,
    enabled: boolean,
  ): void {
    const existingIndex = this._channelPreferences.findIndex(
      (p) => p.channel === channel,
    );

    if (existingIndex >= 0) {
      this._channelPreferences[existingIndex].enabled = enabled;
    } else {
      this._channelPreferences.push({ channel, enabled });
    }
    this._updatedAt = new Date();
  }

  setDigestFrequency(frequency: DigestFrequency): void {
    this._digestFrequency = frequency;
    this._updatedAt = new Date();
  }

  updateDoNotDisturb(schedule: Partial<DoNotDisturbSchedule>): void {
    this._doNotDisturb = { ...this._doNotDisturb, ...schedule };
    this._updatedAt = new Date();
  }

  isInDoNotDisturbPeriod(currentTime: Date = new Date()): boolean {
    if (!this._doNotDisturb.enabled) {
      return false;
    }

    const [startHour, startMinute] = this._doNotDisturb.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = this._doNotDisturb.endTime
      .split(':')
      .map(Number);

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Handle overnight DND (e.g., 22:00 to 09:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    // Normal same-day DND
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  shouldSendNotification(isCritical: boolean = false): boolean {
    // Critical notifications bypass DND if configured
    if (isCritical && this._bypassDndForCritical) {
      return true;
    }

    // Check if we're in DND period
    return !this.isInDoNotDisturbPeriod();
  }

  setBypassDndForCritical(bypass: boolean): void {
    this._bypassDndForCritical = bypass;
    this._updatedAt = new Date();
  }
}
