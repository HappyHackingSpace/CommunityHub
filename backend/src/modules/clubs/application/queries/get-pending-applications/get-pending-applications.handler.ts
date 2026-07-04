import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPendingApplicationsQuery } from './get-pending-applications.query';
import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import type { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';

@QueryHandler(GetPendingApplicationsQuery)
export class GetPendingApplicationsHandler
  implements IQueryHandler<GetPendingApplicationsQuery>
{
  constructor(
    @Inject('IClubMemberRepository')
    private readonly memberRepository: IClubMemberRepository,
  ) {}

  async execute(query: GetPendingApplicationsQuery): Promise<ClubMember[]> {
    return this.memberRepository.findPendingApplicationsByClub(query.clubId);
  }
}
