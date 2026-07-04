import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPendingMembershipsQuery } from './get-pending-memberships.query';
import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';
import { CommunityMemberStatus } from 'src/modules/communities/domain/enums/community-member-status.enum';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';

@QueryHandler(GetPendingMembershipsQuery)
export class GetPendingMembershipsHandler implements IQueryHandler<GetPendingMembershipsQuery> {
  constructor(
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
  ) {}

  async execute(query: GetPendingMembershipsQuery): Promise<CommunityMember[]> {
    return this.memberRepository.findByStatus(query.communityId, CommunityMemberStatus.PENDING);
  }
}
