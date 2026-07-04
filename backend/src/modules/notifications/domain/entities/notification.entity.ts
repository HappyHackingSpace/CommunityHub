// src/modules/notifications/domain/entities/notification.entity.ts
import { BaseEntity } from '../../../../shared/domain/base-entity';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from '../enums';

export interface NotificationMetadata {
  [key: string]: any;
}

export interface ActionButton {
  label: string;
  action: string;
  url?: string;
}

export class Notification extends BaseEntity {
  private _userId: string;
  private _type: NotificationType;
  private _channel: NotificationChannel;
  private _status: NotificationStatus;
  private _priority: NotificationPriority;
  private _title: string;
  private _message: string;
  private _metadata: NotificationMetadata;
  private _actionButtons?: ActionButton[];
  private _readAt?: Date;
  private _sentAt?: Date;
  private _failureReason?: string;
  private _retryCount: number;
  private _groupKey?: string; // For batching related notifications

  constructor(
    id: string,
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    metadata: NotificationMetadata = {},
    actionButtons?: ActionButton[],
    groupKey?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this._userId = userId;
    this._type = type;
    this._channel = channel;
    this._status = NotificationStatus.PENDING;
    this._priority = priority;
    this._title = title;
    this._message = message;
    this._metadata = metadata;
    this._actionButtons = actionButtons;
    this._groupKey = groupKey;
    this._retryCount = 0;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get type(): NotificationType {
    return this._type;
  }

  get channel(): NotificationChannel {
    return this._channel;
  }

  get status(): NotificationStatus {
    return this._status;
  }

  get priority(): NotificationPriority {
    return this._priority;
  }

  get title(): string {
    return this._title;
  }

  get message(): string {
    return this._message;
  }

  get metadata(): NotificationMetadata {
    return this._metadata;
  }

  get actionButtons(): ActionButton[] | undefined {
    return this._actionButtons;
  }

  get readAt(): Date | undefined {
    return this._readAt;
  }

  get sentAt(): Date | undefined {
    return this._sentAt;
  }

  get failureReason(): string | undefined {
    return this._failureReason;
  }

  get retryCount(): number {
    return this._retryCount;
  }

  get groupKey(): string | undefined {
    return this._groupKey;
  }

  // Business methods
  markAsSent(): void {
    this._status = NotificationStatus.SENT;
    this._sentAt = new Date();
    this._updatedAt = new Date();
  }

  markAsFailed(reason: string): void {
    this._status = NotificationStatus.FAILED;
    this._failureReason = reason;
    this._retryCount++;
    this._updatedAt = new Date();
  }

  markAsRead(): void {
    if (this._status === NotificationStatus.SENT && !this._readAt) {
      this._status = NotificationStatus.READ;
      this._readAt = new Date();
      this._updatedAt = new Date();
    }
  }

  archive(): void {
    this._status = NotificationStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  canRetry(maxRetries: number = 3): boolean {
    return this._status === NotificationStatus.FAILED && this._retryCount < maxRetries;
  }

  retry(): void {
    if (this.canRetry()) {
      this._status = NotificationStatus.PENDING;
      this._failureReason = undefined;
      this._updatedAt = new Date();
    }
  }
}
