import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBadgeRepository } from '../../../../domain/repositories/badge.repository.interface';
import { Badge } from '../../../../domain/entities/badge.entity';
import { BadgeType } from '../../../../domain/enums/badge-type.enum';
import { BadgeOrmEntity } from '../entities/badge.orm-entity';
import { BadgeMapper } from '../mappers/badge.mapper';

@Injectable()
export class BadgeRepository implements IBadgeRepository {
  constructor(
    @InjectRepository(BadgeOrmEntity)
    private readonly repository: Repository<BadgeOrmEntity>,
  ) {}

  async save(badge: Badge): Promise<Badge> {
    const ormEntity = BadgeMapper.toPersistence(badge);
    const saved = await this.repository.save(ormEntity);
    return BadgeMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Badge | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? BadgeMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<Badge[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => BadgeMapper.toDomain(entity));
  }

  async findByUserIdAndType(
    userId: string,
    type: BadgeType,
  ): Promise<Badge | null> {
    const ormEntity = await this.repository.findOne({
      where: { userId, type },
    });
    return ormEntity ? BadgeMapper.toDomain(ormEntity) : null;
  }

  async getUserTotalPoints(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('badge')
      .select('SUM(badge.points)', 'total')
      .where('badge.user_id = :userId', { userId })
      .getRawOne();
    return result?.total || 0;
  }

  async getLeaderboard(
    limit: number = 10,
  ): Promise<Array<{ userId: string; totalPoints: number; badgeCount: number }>> {
    const results = await this.repository
      .createQueryBuilder('badge')
      .select('badge.user_id', 'userId')
      .addSelect('SUM(badge.points)', 'totalPoints')
      .addSelect('COUNT(badge.id)', 'badgeCount')
      .groupBy('badge.user_id')
      .orderBy('totalPoints', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((result) => ({
      userId: result.userId,
      totalPoints: parseInt(result.totalPoints, 10),
      badgeCount: parseInt(result.badgeCount, 10),
    }));
  }
}
