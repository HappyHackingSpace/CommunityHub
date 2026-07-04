import { Badge } from '../entities/badge.entity';
import { BadgeType } from '../enums/badge-type.enum';

export interface IBadgeRepository {
  save(badge: Badge): Promise<Badge>;
  findById(id: string): Promise<Badge | null>;
  findByUserId(userId: string): Promise<Badge[]>;
  findByUserIdAndType(userId: string, type: BadgeType): Promise<Badge | null>;
  getUserTotalPoints(userId: string): Promise<number>;
  getLeaderboard(limit?: number): Promise<Array<{ userId: string; totalPoints: number; badgeCount: number }>>;
}
