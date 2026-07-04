// src/modules/notifications/infrastructure/persistence/notification-preference.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { INotificationPreferenceRepository } from '../../domain/repositories';
import { NotificationPreference } from '../../domain/entities';
import { NotificationType, NotificationChannel, DigestFrequency } from '../../domain/enums';
import { NotificationPreferenceSchema } from './notification-preference.schema';
import { NotificationPreferenceMapper } from './notification-preference.mapper';

@Injectable()
export class NotificationPreferenceRepository implements INotificationPreferenceRepository {
  constructor(
    @InjectRepository(NotificationPreferenceSchema)
    private readonly repository: Repository<NotificationPreferenceSchema>,
  ) {}

  async save(preference: NotificationPreference): Promise<NotificationPreference> {
    const schema = NotificationPreferenceMapper.toSchema(preference);
    const saved = await this.repository.save(schema);
    return NotificationPreferenceMapper.toDomain(saved);
  }

  async findById(id: string): Promise<NotificationPreference | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? NotificationPreferenceMapper.toDomain(schema) : null;
  }

  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    const schemas = await this.repository.find({ where: { userId } });
    return schemas.map(NotificationPreferenceMapper.toDomain);
  }

  async findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationPreference | null> {
    const schema = await this.repository.findOne({
      where: { userId, notificationType: type },
    });
    return schema ? NotificationPreferenceMapper.toDomain(schema) : null;
  }

  async createDefaultPreferences(userId: string): Promise<NotificationPreference[]> {
    const defaultPreferences: NotificationPreference[] = [];

    // Create default preferences for all notification types
    for (const type of Object.values(NotificationType)) {
      const preference = new NotificationPreference(
        uuidv4(),
        userId,
        type as NotificationType,
        [
          { channel: NotificationChannel.EMAIL, enabled: true },
          { channel: NotificationChannel.IN_APP, enabled: true },
          { channel: NotificationChannel.PUSH, enabled: false },
        ],
        DigestFrequency.DISABLED,
        {
          enabled: false,
          startTime: '22:00',
          endTime: '09:00',
        },
        true,
      );

      defaultPreferences.push(preference);
    }

    // Save all preferences
    const schemas = defaultPreferences.map(NotificationPreferenceMapper.toSchema);
    const saved = await this.repository.save(schemas);

    return saved.map(NotificationPreferenceMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
