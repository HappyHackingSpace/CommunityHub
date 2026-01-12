import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantAccessGuard } from 'src/shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from 'src/shared/guards/tenant-context-complete.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { GetGamificationLeaderboardQuery } from '../../application/queries/get-gamification-leaderboard/get-gamification-leaderboard.query';
import { GetUserBadgesQuery } from '../../application/queries/get-user-badges/get-user-badges.query';
import { LeaderboardResponseDto } from '../../application/dto/leaderboard-response.dto';
import { BadgeResponseDto } from '../../application/dto/badge-response.dto';

@Controller('gamification')
@UseGuards(JwtAuthGuard, TenantContextCompleteGuard, TenantAccessGuard)
export class GamificationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Query('limit') limit?: string,
  ): Promise<LeaderboardResponseDto> {
    const query = new GetGamificationLeaderboardQuery(
      limit ? parseInt(limit, 10) : 10,
    );
    return this.queryBus.execute(query);
  }

  @Get('my-badges')
  @HttpCode(HttpStatus.OK)
  async getMyBadges(
    @CurrentUser('sub') userId: string,
  ): Promise<BadgeResponseDto[]> {
    const query = new GetUserBadgesQuery(userId);
    return this.queryBus.execute(query);
  }

  @Get('badges/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserBadges(
    @Query('userId') userId: string,
  ): Promise<BadgeResponseDto[]> {
    const query = new GetUserBadgesQuery(userId);
    return this.queryBus.execute(query);
  }
}