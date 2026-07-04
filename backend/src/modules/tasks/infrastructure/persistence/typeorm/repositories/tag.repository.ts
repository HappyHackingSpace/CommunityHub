import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ITagRepository } from '../../../../domain/repositories/tag.repository.interface';
import { Tag } from '../../../../domain/entities/tag.entity';
import { TagOrmEntity } from '../entities/tag.orm-entity';
import { TagMapper } from '../mappers/tag.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(
    @InjectRepository(TagOrmEntity)
    private readonly repository: Repository<TagOrmEntity>,
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

  async save(tag: Tag): Promise<Tag> {
    const ormEntity = TagMapper.toPersistence(tag);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return TagMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Tag | null> {
    const ormEntity = await this.createTenantQueryBuilder('tag')
      .andWhere('tag.id = :id', { id })
      .getOne();
    return ormEntity ? TagMapper.toDomain(ormEntity) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const ormEntity = await this.createTenantQueryBuilder('tag')
      .andWhere('tag.name = :name', { name: name.toLowerCase() })
      .getOne();
    return ormEntity ? TagMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Tag[]> {
    const ormEntities = await this.createTenantQueryBuilder('tag')
      .orderBy('tag.name', 'ASC')
      .getMany();
    return ormEntities.map((entity) => TagMapper.toDomain(entity));
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) return [];
    const ormEntities = await this.createTenantQueryBuilder('tag')
      .andWhere('tag.id IN (:...ids)', { ids })
      .getMany();
    return ormEntities.map((entity) => TagMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('tag')
      .delete()
      .andWhere('tag.id = :id', { id })
      .execute();
  }
}
