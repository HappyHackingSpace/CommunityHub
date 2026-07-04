import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../../domain/entities/role.entity';
import { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { RoleType } from '../../../../domain/enums/role-type.enum';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private ormRepository: Repository<RoleOrmEntity>,
  ) {}

  async save(role: Role): Promise<void> {
    const orm = RoleMapper.toPersistence(role);
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<Role | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? RoleMapper.toDomain(orm) : null;
  }

  async findByRoleType(roleType: RoleType): Promise<Role | null> {
    const orm = await this.ormRepository.findOne({ where: { roleType } });
    return orm ? RoleMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Role[]> {
    const orms = await this.ormRepository.find();
    return orms.map(orm => RoleMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
