import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityFeedItem } from '../../../../domain/entities/activity-feed-item.entity';
import { IActivityFeedItemRepository } from '../../../../domain/repositories/activity-feed-item.repository.interface';
import { ActivityType } from '../../../../domain/enums/activity-type.enum';
import { ActivityFeedItemOrmEntity } from '../entities/activity-feed-item.orm-entity';
import { ActivityFeedItemMapper } from '../mappers/activity-feed-item.mapper';

@Injectable()
export class ActivityFeedItemRepository implements IActivityFeedItemRepository {
  constructor(
    @InjectRepository(ActivityFeedItemOrmEntity)
    private ormRepository: Repository<ActivityFeedItemOrmEntity>,
  ) {}

  async save(item: ActivityFeedItem): Promise<void> {
    const orm = ActivityFeedItemMapper.toPersistence(item);
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<ActivityFeedItem | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? ActivityFeedItemMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<ActivityFeedItem[]> {
    const orms = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => ActivityFeedItemMapper.toDomain(orm));
  }

  async findByActivityType(type: ActivityType, limit: number, offset: number): Promise<ActivityFeedItem[]> {
    const orms = await this.ormRepository.find({
      where: { activityType: type },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => ActivityFeedItemMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<ActivityFeedItem[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => ActivityFeedItemMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.ormRepository.countBy({ userId });
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
  }
}
