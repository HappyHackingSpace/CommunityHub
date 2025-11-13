import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialPost } from '../../../../domain/entities/social-post.entity';
import { ISocialPostRepository } from '../../../../domain/repositories/social-post.repository.interface';
import { PostStatus } from '../../../../domain/enums/post-status.enum';
import { SocialPostOrmEntity } from '../entities/social-post.orm-entity';
import { SocialPostMapper } from '../mappers/social-post.mapper';

@Injectable()
export class SocialPostRepository implements ISocialPostRepository {
  constructor(
    @InjectRepository(SocialPostOrmEntity)
    private ormRepository: Repository<SocialPostOrmEntity>,
  ) {}

  async save(post: SocialPost): Promise<void> {
    const orm = SocialPostMapper.toPersistence(post);
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<SocialPost | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? SocialPostMapper.toDomain(orm) : null;
  }

  async findByAuthorId(authorId: string, limit: number, offset: number): Promise<SocialPost[]> {
    const orms = await this.ormRepository.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => SocialPostMapper.toDomain(orm));
  }

  async findByStatus(status: PostStatus, limit: number, offset: number): Promise<SocialPost[]> {
    const orms = await this.ormRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => SocialPostMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<SocialPost[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => SocialPostMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countByAuthorId(authorId: string): Promise<number> {
    return this.ormRepository.countBy({ authorId });
  }

  async countByStatus(status: PostStatus): Promise<number> {
    return this.ormRepository.countBy({ status });
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
  }
}
