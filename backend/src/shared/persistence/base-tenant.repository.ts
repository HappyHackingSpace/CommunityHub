import { Repository, SelectQueryBuilder } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ForbiddenException } from '@nestjs/common';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';

export abstract class BaseTenantRepository<Entity extends { tenantId: number }> {
  constructor(
    protected repository: Repository<Entity>,
    protected cls: ClsService,
    protected tenantIdColumnName: string = 'tenantId',
  ) {}

  protected getTenantContext(): TenantContext {
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);

    if (!tenantContext || !tenantContext.tenantId) {
      throw new ForbiddenException('Tenant context is not set or invalid');
    }

    return tenantContext;
  }

  protected getTenantId(): number {
    return this.getTenantContext().tenantId;
  }

  protected createTenantQueryBuilder(alias: string): SelectQueryBuilder<Entity> {
    const tenantId = this.getTenantId();

    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.${this.tenantIdColumnName} = :tenantId`, {
        tenantId,
      });
  }

  async find(options?: any): Promise<Entity[]> {
    return this.createTenantQueryBuilder('entity')
      .addOrderBy('entity.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string | number): Promise<Entity | null> {
    return this.createTenantQueryBuilder('entity')
      .andWhere('entity.id = :id', { id })
      .getOne();
  }

  async findOne(options: Record<string, any>): Promise<Entity | null> {
    const qb = this.createTenantQueryBuilder('entity');

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    });

    return qb.getOne();
  }

  async findMany(options: Record<string, any>): Promise<Entity[]> {
    const qb = this.createTenantQueryBuilder('entity');

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    });

    return qb.getMany();
  }

  async create(entity: Partial<Entity>): Promise<Entity> {
    const tenantId = this.getTenantId();
    const newEntity = this.repository.create({
      ...entity,
      [this.tenantIdColumnName]: tenantId,
    } as any);

    return this.repository.save(newEntity) as unknown as Promise<Entity>;
  }

  async update(id: string | number, updates: Partial<Entity>): Promise<Entity | null> {
    await this.createTenantQueryBuilder('entity')
      .update()
      .set(updates as any)
      .andWhere('entity.id = :id', { id })
      .execute();

    return this.findById(id);
  }

  async delete(id: string | number): Promise<boolean> {
    const result = await this.createTenantQueryBuilder('entity')
      .delete()
      .andWhere('entity.id = :id', { id })
      .execute();

    return result.affected ? result.affected > 0 : false;
  }

  async count(options?: Record<string, any>): Promise<number> {
    const qb = this.createTenantQueryBuilder('entity');

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      });
    }

    return qb.getCount();
  }

  async findWithJoin(
    relations: string[],
    options?: Record<string, any>,
  ): Promise<Entity[]> {
    let qb = this.createTenantQueryBuilder('entity');

    relations.forEach(rel => {
      qb = qb.leftJoinAndSelect(`entity.${rel}`, rel);
    });

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          qb = qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      });
    }

    return qb.getMany();
  }

  async exists(id: string | number): Promise<boolean> {
    const count = await this.createTenantQueryBuilder('entity')
      .andWhere('entity.id = :id', { id })
      .getCount();

    return count > 0;
  }
}
