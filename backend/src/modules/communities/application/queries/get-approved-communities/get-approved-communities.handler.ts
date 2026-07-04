import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetApprovedCommunitiesQuery } from './get-approved-communities.query';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';

@QueryHandler(GetApprovedCommunitiesQuery)
export class GetApprovedCommunitiesHandler implements IQueryHandler<GetApprovedCommunitiesQuery> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute(): Promise<Community[]> {
    return this.communityRepository.findAll();
  }
}
