import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubRole } from 'src/modules/clubs/domain/entities/club-role.entity';
import { IClubRoleRepository } from 'src/modules/clubs/domain/repositories/club-role.repository.interface';
import { ClubRoleType } from 'src/modules/clubs/domain/enums/club-role-type.enum';
import { ClubRoleOrmEntity } from '../entities/club-role.orm-entity';
import { ClubRoleMapper } from '../mappers/club-role.mapper';

@Injectable()
export class ClubRoleRepository implements IClubRoleRepository {
  constructor(
    @InjectRepository(ClubRoleOrmEntity)
    private readonly repository: Repository<ClubRoleOrmEntity>,
  ) {}

  async create(role: ClubRole): Promise<void> {
    const ormEntity = ClubRoleMapper.toPersistence(role);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<ClubRole | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? ClubRoleMapper.toDomain(ormEntity) : null;
  }

  async findByClubAndName(
    clubId: string,
    name: string,
  ): Promise<ClubRole | null> {
    const ormEntity = await this.repository.findOne({
      where: { clubId, name },
    });
    return ormEntity ? ClubRoleMapper.toDomain(ormEntity) : null;
  }

  async update(role: ClubRole): Promise<void> {
    const ormEntity = ClubRoleMapper.toPersistence(role);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findRolesByClub(clubId: string): Promise<ClubRole[]> {
    const ormEntities = await this.repository.find({ where: { clubId } });
    return ormEntities.map((entity) => ClubRoleMapper.toDomain(entity));
  }

  async findRolesByClubAndType(
    clubId: string,
    roleType: ClubRoleType,
  ): Promise<ClubRole[]> {
    const ormEntities = await this.repository.find({
      where: { clubId, roleType },
    });
    return ormEntities.map((entity) => ClubRoleMapper.toDomain(entity));
  }

  async findCustomRolesByClub(clubId: string): Promise<ClubRole[]> {
    const ormEntities = await this.repository.find({
      where: { clubId, isCustom: true },
    });
    return ormEntities.map((entity) => ClubRoleMapper.toDomain(entity));
  }
}
