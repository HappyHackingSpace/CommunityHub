import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import { CommunityOrmEntity } from '../entities/community.orm-entity';
import { CommunityMapper } from '../mappers/community.mapper';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(
    @InjectRepository(CommunityOrmEntity)
    private readonly repository: Repository<CommunityOrmEntity>,
  ) {}

  async create(community: Community): Promise<void> {
    const ormEntity = CommunityMapper.toPersistence(community);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<Community | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? CommunityMapper.toDomain(ormEntity) : null;
  }

  async findByName(name: string): Promise<Community | null> {
    const ormEntity = await this.repository.findOne({ where: { name } });
    return ormEntity ? CommunityMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Community[]> {
    const ormEntities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => CommunityMapper.toDomain(entity));
  }

  async findByFounderId(founderId: string): Promise<Community[]> {
    const ormEntities = await this.repository.find({
      where: { founderId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => CommunityMapper.toDomain(entity));
  }

  async update(community: Community): Promise<void> {
    const ormEntity = CommunityMapper.toPersistence(community);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
