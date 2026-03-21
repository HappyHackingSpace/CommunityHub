import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { Club } from 'src/modules/clubs/domain/entities/club.entity';
import { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';
import { ClubOrmEntity } from '../entities/club.orm-entity';
import { ClubMapper } from '../mappers/club.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class ClubRepository implements IClubRepository {
  constructor(
    @InjectRepository(ClubOrmEntity)
    private readonly repository: Repository<ClubOrmEntity>,
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

  async create(club: Club): Promise<void> {
    const ormEntity = ClubMapper.toPersistence(club);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<Club | null> {
    const ormEntity = await this.createTenantQueryBuilder('club')
      .andWhere('club.id = :id', { id })
      .getOne();
    return ormEntity ? ClubMapper.toDomain(ormEntity) : null;
  }

  async findByName(name: string): Promise<Club | null> {
    const ormEntity = await this.createTenantQueryBuilder('club')
      .andWhere('club.name = :name', { name })
      .getOne();
    return ormEntity ? ClubMapper.toDomain(ormEntity) : null;
  }

  async update(club: Club): Promise<void> {
    const ormEntity = ClubMapper.toPersistence(club);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('club')
      .delete()
      .andWhere('club.id = :id', { id })
      .execute();
  }

  async findAll(): Promise<Club[]> {
    const ormEntities = await this.createTenantQueryBuilder('club')
      .getMany();
    return ormEntities.map((entity) => ClubMapper.toDomain(entity));
  }

  async findPublicClubs(): Promise<Club[]> {
    const ormEntities = await this.createTenantQueryBuilder('club')
      .andWhere('club.visibility = :visibility', { visibility: 'PUBLIC' })
      .getMany();
    return ormEntities.map((entity) => ClubMapper.toDomain(entity));
  }

  async findClubsByLeader(leaderId: string): Promise<Club[]> {
    const ormEntities = await this.createTenantQueryBuilder('club')
      .andWhere(':leaderId = ANY(club.leaders)', { leaderId })
      .getMany();
    return ormEntities.map((entity) => ClubMapper.toDomain(entity));
  }
}
