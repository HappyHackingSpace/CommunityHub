import { UserBan } from '../entities/user-ban.entity';

export interface IUserBanRepository {
  save(ban: UserBan): Promise<void>;
  findById(id: string): Promise<UserBan | null>;
  findActiveByUserId(userId: string): Promise<UserBan | null>;
  findByUserId(userId: string, limit: number, offset: number): Promise<UserBan[]>;
  findAll(limit: number, offset: number): Promise<UserBan[]>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
