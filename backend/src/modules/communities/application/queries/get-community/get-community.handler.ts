import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCommunityQuery } from './get-community.query';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';

@QueryHandler(GetCommunityQuery)
export class GetCommunityHandler implements IQueryHandler<GetCommunityQuery> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute(query: GetCommunityQuery): Promise<Community> {
    const community = await this.communityRepository.findById(query.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }
}
