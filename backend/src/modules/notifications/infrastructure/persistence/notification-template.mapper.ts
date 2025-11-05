// src/modules/notifications/infrastructure/persistence/notification-template.mapper.ts
import { NotificationTemplate } from '../../domain/entities';
import { NotificationTemplateSchema } from './notification-template.schema';

export class NotificationTemplateMapper {
  static toDomain(schema: NotificationTemplateSchema): NotificationTemplate {
    return new NotificationTemplate(
      schema.id,
      schema.type,
      schema.channel,
      schema.bodyTemplate,
      schema.subject,
      schema.actionButtonsTemplate,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  static toSchema(template: NotificationTemplate): NotificationTemplateSchema {
    const schema = new NotificationTemplateSchema();
    schema.id = template.id;
    schema.type = template.type;
    schema.channel = template.channel;
    schema.subject = template.subject;
    schema.bodyTemplate = template.bodyTemplate;
    schema.actionButtonsTemplate = template.actionButtonsTemplate;
    schema.createdAt = template.createdAt;
    schema.updatedAt = template.updatedAt;

    return schema;
  }
}
