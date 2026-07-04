// src/modules/notifications/infrastructure/persistence/notification-template.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationTemplateRepository } from '../../domain/repositories';
import { NotificationTemplate } from '../../domain/entities';
import { NotificationType, NotificationChannel } from '../../domain/enums';
import { NotificationTemplateSchema } from './notification-template.schema';
import { NotificationTemplateMapper } from './notification-template.mapper';

@Injectable()
export class NotificationTemplateRepository implements INotificationTemplateRepository {
  constructor(
    @InjectRepository(NotificationTemplateSchema)
    private readonly repository: Repository<NotificationTemplateSchema>,
  ) {}

  async save(template: NotificationTemplate): Promise<NotificationTemplate> {
    const schema = NotificationTemplateMapper.toSchema(template);
    const saved = await this.repository.save(schema);
    return NotificationTemplateMapper.toDomain(saved);
  }

  async findById(id: string): Promise<NotificationTemplate | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? NotificationTemplateMapper.toDomain(schema) : null;
  }

  async findByTypeAndChannel(
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate | null> {
    const schema = await this.repository.findOne({
      where: { type, channel },
    });
    return schema ? NotificationTemplateMapper.toDomain(schema) : null;
  }

  async findAll(): Promise<NotificationTemplate[]> {
    const schemas = await this.repository.find();
    return schemas.map(NotificationTemplateMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
