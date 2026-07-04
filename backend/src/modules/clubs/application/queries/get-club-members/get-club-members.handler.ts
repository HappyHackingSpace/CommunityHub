import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClubMembersQuery } from './get-club-members.query';
import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import type { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';

@QueryHandler(GetClubMembersQuery)
export class GetClubMembersHandler
  implements IQueryHandler<GetClubMembersQuery>
{
  constructor(
    @Inject('IClubMemberRepository')
    private readonly memberRepository: IClubMemberRepository,
  ) {}

  async execute(query: GetClubMembersQuery): Promise<ClubMember[]> {
    return this.memberRepository.findMembersByClub(query.clubId);
  }
}
