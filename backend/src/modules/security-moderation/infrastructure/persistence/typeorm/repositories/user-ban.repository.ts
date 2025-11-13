import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserBan } from '../../../../domain/entities/user-ban.entity';
import { IUserBanRepository } from '../../../../domain/repositories/user-ban.repository.interface';
import { UserBanOrmEntity } from '../entities/user-ban.orm-entity';
import { UserBanMapper } from '../mappers/user-ban.mapper';

@Injectable()
export class UserBanRepository implements IUserBanRepository {
  constructor(
    @InjectRepository(UserBanOrmEntity)
    private ormRepository: Repository<UserBanOrmEntity>,
  ) {}

  async save(ban: UserBan): Promise<void> {
    const orm = UserBanMapper.toPersistence(ban);
    await this.ormRepository.save(orm);
  }

  async findById(id: string): Promise<UserBan | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? UserBanMapper.toDomain(orm) : null;
  }

  async findActiveByUserId(userId: string): Promise<UserBan | null> {
    const now = new Date();
    const orm = await this.ormRepository.findOne({
      where: { userId, banUntil: MoreThan(now) } as any,
    });

    if (orm) {
      return UserBanMapper.toDomain(orm);
    }

    const permORM = await this.ormRepository.findOne({
      where: { userId, banUntil: null as any },
    });

    return permORM ? UserBanMapper.toDomain(permORM) : null;
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<UserBan[]> {
    const orms = await this.ormRepository.find({
      where: { userId } as any,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => UserBanMapper.toDomain(orm));
  }

  async findAll(limit: number, offset: number): Promise<UserBan[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return orms.map(orm => UserBanMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.ormRepository.countBy({ userId });
  }
}
