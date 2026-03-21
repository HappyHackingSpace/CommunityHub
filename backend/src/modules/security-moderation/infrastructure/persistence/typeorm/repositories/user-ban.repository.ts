import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { UserBan } from '../../../../domain/entities/user-ban.entity';
import { IUserBanRepository } from '../../../../domain/repositories/user-ban.repository.interface';
import { UserBanOrmEntity } from '../entities/user-ban.orm-entity';
import { UserBanMapper } from '../mappers/user-ban.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class UserBanRepository implements IUserBanRepository {
  constructor(
    @InjectRepository(UserBanOrmEntity)
    private ormRepository: Repository<UserBanOrmEntity>,
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
    return this.ormRepository
      .createQueryBuilder(alias)
      .where(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  async save(ban: UserBan): Promise<void> {
    const orm = UserBanMapper.toPersistence(ban);
    const tenantId = this.getTenantId();
    (orm as any).tenantId = tenantId;
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<UserBan | null> {
    const orm = await this.createTenantQueryBuilder('userBan')
      .andWhere('userBan.id = :id', { id })
      .getOne();
    return orm ? UserBanMapper.toDomain(orm) : null;
  }

  async findActiveByUserId(userId: string): Promise<UserBan | null> {
    const now = new Date();
    const orm = await this.createTenantQueryBuilder('userBan')
      .andWhere('userBan.userId = :userId', { userId })
      .andWhere('userBan.banUntil > :now', { now })
      .getOne();

    if (orm) {
      return UserBanMapper.toDomain(orm);
    }

    const permORM = await this.createTenantQueryBuilder('userBan')
      .andWhere('userBan.userId = :userId', { userId })
      .andWhere('userBan.banUntil IS NULL')
      .getOne();

    return permORM ? UserBanMapper.toDomain(permORM) : null;
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<UserBan[]> {
    const orms = await this.createTenantQueryBuilder('userBan')
      .andWhere('userBan.userId = :userId', { userId })
      .orderBy('userBan.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => UserBanMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<UserBan[]> {
    const orms = await this.createTenantQueryBuilder('userBan')
      .orderBy('userBan.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => UserBanMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('userBan')
      .delete()
      .andWhere('userBan.id = :id', { id })
      .execute();
  }

  async countByUserId(userId: string): Promise<number> {
    return this.createTenantQueryBuilder('userBan')
      .andWhere('userBan.userId = :userId', { userId })
      .getCount();
  }
}
