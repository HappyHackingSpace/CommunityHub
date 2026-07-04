// src/modules/notifications/infrastructure/persistence/notification-preference.mapper.ts
import { NotificationPreference } from '../../domain/entities';
import { NotificationPreferenceSchema } from './notification-preference.schema';

export class NotificationPreferenceMapper {
  static toDomain(schema: NotificationPreferenceSchema): NotificationPreference {
    return new NotificationPreference(
      schema.id,
      schema.userId,
      schema.notificationType,
      schema.channelPreferences,
      schema.digestFrequency,
      schema.doNotDisturb,
      schema.bypassDndForCritical,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  static toSchema(preference: NotificationPreference): NotificationPreferenceSchema {
    const schema = new NotificationPreferenceSchema();
    schema.id = preference.id;
    schema.userId = preference.userId;
    schema.notificationType = preference.notificationType;
    schema.channelPreferences = preference.channelPreferences;
    schema.digestFrequency = preference.digestFrequency;
    schema.doNotDisturb = preference.doNotDisturb;
    schema.bypassDndForCritical = preference.bypassDndForCritical;
    schema.createdAt = preference.createdAt;
    schema.updatedAt = preference.updatedAt;

    return schema;
  }
}
