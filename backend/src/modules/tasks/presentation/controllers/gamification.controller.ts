import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { GetGamificationLeaderboardQuery } from '../../application/queries/get-gamification-leaderboard/get-gamification-leaderboard.query';
import { GetUserBadgesQuery } from '../../application/queries/get-user-badges/get-user-badges.query';
import { LeaderboardResponseDto } from '../../application/dto/leaderboard-response.dto';
import { BadgeResponseDto } from '../../application/dto/badge-response.dto';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get gamification leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Returns the leaderboard with top contributors',
    type: LeaderboardResponseDto,
  })
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
  @ApiOperation({ summary: 'Get current user badges' })
  @ApiResponse({
    status: 200,
    description: 'Returns all badges earned by the current user',
    type: [BadgeResponseDto],
  })
  async getMyBadges(
    @CurrentUser('sub') userId: string,
  ): Promise<BadgeResponseDto[]> {
    const query = new GetUserBadgesQuery(userId);
    return this.queryBus.execute(query);
  }

  @Get('badges/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get badges for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all badges earned by the specified user',
    type: [BadgeResponseDto],
  })
  async getUserBadges(
    @Query('userId') userId: string,
  ): Promise<BadgeResponseDto[]> {
    const query = new GetUserBadgesQuery(userId);
    return this.queryBus.execute(query);
  }
}
