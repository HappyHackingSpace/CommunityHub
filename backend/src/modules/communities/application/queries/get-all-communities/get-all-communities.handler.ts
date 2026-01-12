import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllCommunitiesQuery } from './get-all-communities.query';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';

@QueryHandler(GetAllCommunitiesQuery)
export class GetAllCommunitiesHandler implements IQueryHandler<GetAllCommunitiesQuery> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute(): Promise<Community[]> {
    return this.communityRepository.findAll();
  }
}
