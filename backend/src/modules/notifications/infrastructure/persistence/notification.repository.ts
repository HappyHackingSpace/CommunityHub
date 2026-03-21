// src/modules/notifications/infrastructure/persistence/notification.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { INotificationRepository } from '../../domain/repositories';
import { Notification } from '../../domain/entities';
import { NotificationStatus, NotificationType } from '../../domain/enums';
import { NotificationSchema } from './notification.schema';
import { NotificationMapper } from './notification.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationSchema)
    private readonly repository: Repository<NotificationSchema>,
    private cls: ClsService,
  ) {}

  protected getTenantId(): string {
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Tenant context is not set');
    }
    return tenantContext.tenantId;
  }

  protected createTenantQueryBuilder(alias: string) {
    const tenantId = this.getTenantId();
    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  async save(notification: Notification): Promise<Notification> {
    const schema = NotificationMapper.toSchema(notification);
    const tenantId = this.getTenantId();
    (schema as any).tenantId = tenantId;
    const saved = await this.repository.save(schema);
    return NotificationMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Notification | null> {
    const schema = await this.createTenantQueryBuilder('notification')
      .andWhere('notification.id = :id', { id })
      .getOne();
    return schema ? NotificationMapper.toDomain(schema) : null;
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    const schemas = await this.createTenantQueryBuilder('notification')
      .andWhere('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit)
      .getMany();
    return schemas.map(NotificationMapper.toDomain);
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const schemas = await this.createTenantQueryBuilder('notification')
      .andWhere('notification.userId = :userId', { userId })
      .andWhere('notification.status = :status', { status: NotificationStatus.SENT })
      .andWhere('notification.readAt IS NULL')
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
    return schemas.map(NotificationMapper.toDomain);
  }

  async findPendingNotifications(limit: number = 100): Promise<Notification[]> {
    const schemas = await this.createTenantQueryBuilder('notification')
      .andWhere('notification.status = :status', { status: NotificationStatus.PENDING })
      .orderBy('notification.createdAt', 'ASC')
      .limit(limit)
      .getMany();
    return schemas.map(NotificationMapper.toDomain);
  }

  async findByGroupKey(groupKey: string): Promise<Notification[]> {
    const schemas = await this.createTenantQueryBuilder('notification')
      .andWhere('notification.groupKey = :groupKey', { groupKey })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
    return schemas.map(NotificationMapper.toDomain);
  }

  async findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]> {
    const schemas = await this.createTenantQueryBuilder('notification')
      .andWhere('notification.userId = :userId', { userId })
      .andWhere('notification.type = :type', { type })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
    return schemas.map(NotificationMapper.toDomain);
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<void> {
    const tenantId = this.getTenantId();
    await this.repository.update(
      { tenantId, id },
      { status },
    );
  }

  async markAsRead(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    await this.repository.update(
      { tenantId, id },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    const tenantId = this.getTenantId();
    await this.repository.update(
      { tenantId, userId, status: NotificationStatus.SENT },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ tenantId: this.getTenantId(), id });
  }

  async deleteOldNotifications(olderThanDays: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    const result = await this.repository.delete({
      tenantId: this.getTenantId(),
      createdAt: LessThan(date),
    });

    return result.affected || 0;
  }
}
