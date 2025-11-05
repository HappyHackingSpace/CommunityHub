// src/modules/notifications/domain/entities/notification-template.entity.ts
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { NotificationType, NotificationChannel } from '../enums';

export class NotificationTemplate extends BaseEntity {
  private _type: NotificationType;
  private _channel: NotificationChannel;
  private _subject?: string; // For email templates
  private _bodyTemplate: string; // Template with placeholders like {{userName}}
  private _actionButtonsTemplate?: string; // JSON string of action buttons template

  constructor(
    id: string,
    type: NotificationType,
    channel: NotificationChannel,
    bodyTemplate: string,
    subject?: string,
    actionButtonsTemplate?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this._type = type;
    this._channel = channel;
    this._subject = subject;
    this._bodyTemplate = bodyTemplate;
    this._actionButtonsTemplate = actionButtonsTemplate;
  }

  // Getters
  get type(): NotificationType {
    return this._type;
  }

  get channel(): NotificationChannel {
    return this._channel;
  }

  get subject(): string | undefined {
    return this._subject;
  }

  get bodyTemplate(): string {
    return this._bodyTemplate;
  }

  get actionButtonsTemplate(): string | undefined {
    return this._actionButtonsTemplate;
  }

  // Business methods
  render(data: Record<string, any>): { subject?: string; body: string } {
    const body = this.replacePlaceholders(this._bodyTemplate, data);
    const subject = this._subject
      ? this.replacePlaceholders(this._subject, data)
      : undefined;

    return { subject, body };
  }

  private replacePlaceholders(
    template: string,
    data: Record<string, any>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  updateTemplate(bodyTemplate: string, subject?: string): void {
    this._bodyTemplate = bodyTemplate;
    this._subject = subject;
    this._updatedAt = new Date();
  }

  setActionButtonsTemplate(template: string): void {
    this._actionButtonsTemplate = template;
    this._updatedAt = new Date();
  }
}
