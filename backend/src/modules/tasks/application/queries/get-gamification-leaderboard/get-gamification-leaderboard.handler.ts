import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGamificationLeaderboardQuery } from './get-gamification-leaderboard.query';
import type { IBadgeRepository } from '../../../domain/repositories/badge.repository.interface';
import { LeaderboardResponseDto, LeaderboardEntryDto } from '../../dto/leaderboard-response.dto';

@QueryHandler(GetGamificationLeaderboardQuery)
export class GetGamificationLeaderboardHandler
  implements IQueryHandler<GetGamificationLeaderboardQuery>
{
  constructor(
    @Inject('IBadgeRepository')
    private readonly badgeRepository: IBadgeRepository,
  ) {}

  async execute(
    query: GetGamificationLeaderboardQuery,
  ): Promise<LeaderboardResponseDto> {
    const leaderboardData = await this.badgeRepository.getLeaderboard(
      query.limit,
    );

    const entries: LeaderboardEntryDto[] = leaderboardData.map((entry, index) => ({
      userId: entry.userId,
      totalPoints: entry.totalPoints,
      badgeCount: entry.badgeCount,
      rank: index + 1,
    }));

    return {
      entries,
      totalEntries: entries.length,
    };
  }
}
