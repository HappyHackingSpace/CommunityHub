import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from 'src/modules/clubs/domain/entities/club.entity';
import { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';
import { ClubOrmEntity } from '../entities/club.orm-entity';
import { ClubMapper } from '../mappers/club.mapper';

@Injectable()
export class ClubRepository implements IClubRepository {
  constructor(
    @InjectRepository(ClubOrmEntity)
    private readonly repository: Repository<ClubOrmEntity>,
  ) {}

  async create(club: Club): Promise<void> {
    const ormEntity = ClubMapper.toPersistence(club);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<Club | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? ClubMapper.toDomain(ormEntity) : null;
  }

  async findByName(name: string): Promise<Club | null> {
    const ormEntity = await this.repository.findOne({ where: { name } });
    return ormEntity ? ClubMapper.toDomain(ormEntity) : null;
  }

  async update(club: Club): Promise<void> {
    const ormEntity = ClubMapper.toPersistence(club);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<Club[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map((entity) => ClubMapper.toDomain(entity));
  }

  async findPublicClubs(): Promise<Club[]> {
    const ormEntities = await this.repository.find({
      where: { visibility: 'PUBLIC' },
    });
    return ormEntities.map((entity) => ClubMapper.toDomain(entity));
  }

  async findClubsByLeader(leaderId: string): Promise<Club[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('club')
      .where(':leaderId = ANY(club.leaders)', { leaderId })
      .getMany();
    return ormEntities.map((entity) => ClubMapper.toDomain(entity));
  }
}
