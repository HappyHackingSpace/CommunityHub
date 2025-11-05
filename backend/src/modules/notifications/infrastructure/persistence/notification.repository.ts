// src/modules/notifications/infrastructure/persistence/notification.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { INotificationRepository } from '../../domain/repositories';
import { Notification } from '../../domain/entities';
import { NotificationStatus, NotificationType } from '../../domain/enums';
import { NotificationSchema } from './notification.schema';
import { NotificationMapper } from './notification.mapper';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationSchema)
    private readonly repository: Repository<NotificationSchema>,
  ) {}

  async save(notification: Notification): Promise<Notification> {
    const schema = NotificationMapper.toSchema(notification);
    const saved = await this.repository.save(schema);
    return NotificationMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Notification | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? NotificationMapper.toDomain(schema) : null;
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    const schemas = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return schemas.map(NotificationMapper.toDomain);
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const schemas = await this.repository.find({
      where: {
        userId,
        status: NotificationStatus.SENT,
        readAt: null as any,
      },
      order: { createdAt: 'DESC' },
    });
    return schemas.map(NotificationMapper.toDomain);
  }

  async findPendingNotifications(limit: number = 100): Promise<Notification[]> {
    const schemas = await this.repository.find({
      where: { status: NotificationStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: limit,
    });
    return schemas.map(NotificationMapper.toDomain);
  }

  async findByGroupKey(groupKey: string): Promise<Notification[]> {
    const schemas = await this.repository.find({
      where: { groupKey },
      order: { createdAt: 'DESC' },
    });
    return schemas.map(NotificationMapper.toDomain);
  }

  async findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]> {
    const schemas = await this.repository.find({
      where: { userId, type },
      order: { createdAt: 'DESC' },
    });
    return schemas.map(NotificationMapper.toDomain);
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update(
      {
        userId,
        status: NotificationStatus.SENT,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteOldNotifications(olderThanDays: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    const result = await this.repository.delete({
      createdAt: LessThan(date),
    });

    return result.affected || 0;
  }
}
