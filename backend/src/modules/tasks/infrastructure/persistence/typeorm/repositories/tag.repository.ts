import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ITagRepository } from '../../../../domain/repositories/tag.repository.interface';
import { Tag } from '../../../../domain/entities/tag.entity';
import { TagOrmEntity } from '../entities/tag.orm-entity';
import { TagMapper } from '../mappers/tag.mapper';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(
    @InjectRepository(TagOrmEntity)
    private readonly repository: Repository<TagOrmEntity>,
  ) {}

  async save(tag: Tag): Promise<Tag> {
    const ormEntity = TagMapper.toPersistence(tag);
    const saved = await this.repository.save(ormEntity);
    return TagMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Tag | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? TagMapper.toDomain(ormEntity) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const ormEntity = await this.repository.findOne({
      where: { name: name.toLowerCase() },
    });
    return ormEntity ? TagMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Tag[]> {
    const ormEntities = await this.repository.find({
      order: { name: 'ASC' },
    });
    return ormEntities.map((entity) => TagMapper.toDomain(entity));
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) return [];
    const ormEntities = await this.repository.find({
      where: { id: In(ids) },
    });
    return ormEntities.map((entity) => TagMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
