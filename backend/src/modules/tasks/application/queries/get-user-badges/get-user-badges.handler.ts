import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserBadgesQuery } from './get-user-badges.query';
import type { IBadgeRepository } from '../../../domain/repositories/badge.repository.interface';
import { BadgeResponseDto } from '../../dto/badge-response.dto';
import { Badge } from '../../../domain/entities/badge.entity';

@QueryHandler(GetUserBadgesQuery)
export class GetUserBadgesHandler implements IQueryHandler<GetUserBadgesQuery> {
  constructor(
    @Inject('IBadgeRepository')
    private readonly badgeRepository: IBadgeRepository,
  ) {}

  async execute(query: GetUserBadgesQuery): Promise<BadgeResponseDto[]> {
    const badges = await this.badgeRepository.findByUserId(query.userId);
    return badges.map((badge) => this.toDto(badge));
  }

  private toDto(badge: Badge): BadgeResponseDto {
    return {
      id: badge.id,
      userId: badge.userId,
      type: badge.type,
      name: badge.name,
      description: badge.description,
      points: badge.points,
      metadata: badge.metadata,
      createdAt: badge.createdAt,
    };
  }
}
