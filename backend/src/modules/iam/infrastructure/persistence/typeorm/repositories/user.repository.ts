import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { User } from '../../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const saved = await this.repository.save(ormEntity);
    return UserMapper.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { googleId } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { email } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<User[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map(UserMapper.toDomain);
  }

  async findByRole(role: string): Promise<User[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role })
      .getMany();
    
    return ormEntities.map(UserMapper.toDomain);
  }

  async update(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const updated = await this.repository.save(ormEntity);
    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(googleId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { googleId } });
    return count > 0;
  }
}