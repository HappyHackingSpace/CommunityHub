import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { IBadgeRepository } from '../../../../domain/repositories/badge.repository.interface';
import { Badge } from '../../../../domain/entities/badge.entity';
import { BadgeType } from '../../../../domain/enums/badge-type.enum';
import { BadgeOrmEntity } from '../entities/badge.orm-entity';
import { BadgeMapper } from '../mappers/badge.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class BadgeRepository implements IBadgeRepository {
  constructor(
    @InjectRepository(BadgeOrmEntity)
    private readonly repository: Repository<BadgeOrmEntity>,
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
    // Using property name tenantId which TypeORM should map, 
    // but using explicit query for total reliability
    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.tenant_id = :tenantId`, { tenantId });
  }

  async save(badge: Badge): Promise<Badge> {
    const ormEntity = BadgeMapper.toPersistence(badge);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return BadgeMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Badge | null> {
    const ormEntity = await this.createTenantQueryBuilder('badge')
      .andWhere('badge.id = :id', { id })
      .getOne();
    return ormEntity ? BadgeMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<Badge[]> {
    const ormEntities = await this.createTenantQueryBuilder('badge')
      .andWhere('badge.user_id = :userId', { userId })
      .orderBy('badge.created_at', 'DESC')
      .getMany();
    return ormEntities.map((entity) => BadgeMapper.toDomain(entity));
  }

  async findByUserIdAndType(
    userId: string,
    type: BadgeType,
  ): Promise<Badge | null> {
    const ormEntity = await this.createTenantQueryBuilder('badge')
      .andWhere('badge.user_id = :userId', { userId })
      .andWhere('badge.type = :type', { type })
      .getOne();
    return ormEntity ? BadgeMapper.toDomain(ormEntity) : null;
  }

  async getUserTotalPoints(userId: string): Promise<number> {
    const result = await this.createTenantQueryBuilder('badge')
      .select('SUM(badge.points)', 'total')
      .andWhere('badge.user_id = :userId', { userId })
      .getRawOne();
    return result?.total || 0;
  }

  async getLeaderboard(
    limit: number = 10,
  ): Promise<Array<{ userId: string; totalPoints: number; badgeCount: number }>> {
    const results = await this.createTenantQueryBuilder('badge')
      .select('badge.user_id', 'userId')
      .addSelect('SUM(badge.points)', 'totalPoints')
      .addSelect('COUNT(badge.id)', 'badgeCount')
      .groupBy('badge.user_id')
      .orderBy('SUM(badge.points)', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((result) => ({
      userId: result.userId || result.user_id,
      totalPoints: parseInt(result.totalPoints || result.total_points || 0, 10),
      badgeCount: parseInt(result.badgeCount || result.badge_count || 0, 10),
    }));
  }
}
