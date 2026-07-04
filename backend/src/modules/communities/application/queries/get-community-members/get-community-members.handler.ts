import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommunityMembersQuery } from './get-community-members.query';
import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';

@QueryHandler(GetCommunityMembersQuery)
export class GetCommunityMembersHandler implements IQueryHandler<GetCommunityMembersQuery> {
  constructor(
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
  ) {}

  async execute(query: GetCommunityMembersQuery): Promise<CommunityMember[]> {
    return this.memberRepository.findByCommunityId(query.communityId);
  }
}
