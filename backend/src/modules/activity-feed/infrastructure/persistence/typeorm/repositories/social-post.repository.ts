import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { SocialPost } from '../../../../domain/entities/social-post.entity';
import { ISocialPostRepository } from '../../../../domain/repositories/social-post.repository.interface';
import { PostStatus } from '../../../../domain/enums/post-status.enum';
import { SocialPostOrmEntity } from '../entities/social-post.orm-entity';
import { SocialPostMapper } from '../mappers/social-post.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class SocialPostRepository implements ISocialPostRepository {
  constructor(
    @InjectRepository(SocialPostOrmEntity)
    private ormRepository: Repository<SocialPostOrmEntity>,
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

  async save(post: SocialPost): Promise<void> {
    const orm = SocialPostMapper.toPersistence(post);
    const tenantId = this.getTenantId();
    (orm as any).tenantId = tenantId;
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<SocialPost | null> {
    const orm = await this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.id = :id', { id })
      .getOne();
    return orm ? SocialPostMapper.toDomain(orm) : null;
  }

  async findByAuthorId(authorId: string, limit: number, offset: number): Promise<SocialPost[]> {
    const orms = await this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.authorId = :authorId', { authorId })
      .andWhere('socialPost.status != :status', { status: PostStatus.DELETED })
      .orderBy('socialPost.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => SocialPostMapper.toDomain(orm));
  }

  async findByStatus(status: PostStatus, limit: number, offset: number): Promise<SocialPost[]> {
    const orms = await this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.status = :status', { status })
      .orderBy('socialPost.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => SocialPostMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<SocialPost[]> {
    const orms = await this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.status != :status', { status: PostStatus.DELETED })
      .orderBy('socialPost.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
    return orms.map(orm => SocialPostMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('socialPost')
      .delete()
      .andWhere('socialPost.id = :id', { id })
      .execute();
  }

  async countByAuthorId(authorId: string): Promise<number> {
    return this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.authorId = :authorId', { authorId })
      .andWhere('socialPost.status != :status', { status: PostStatus.DELETED })
      .getCount();
  }

  async countByStatus(status: PostStatus): Promise<number> {
    return this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.status = :status', { status })
      .getCount();
  }

  async countAll(): Promise<number> {
    return this.createTenantQueryBuilder('socialPost')
      .andWhere('socialPost.status != :status', { status: PostStatus.DELETED })
      .getCount();
  }
}
