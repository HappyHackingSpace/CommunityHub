import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCommunityStatsQuery } from './get-community-stats.query';
import type { ICommunityRepository } from 'src/modules/communities/domain/repositories/community.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';
import type { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository.interface';
import type { IMeetingRepository } from 'src/modules/meetings/domain/repositories/meeting.repository.interface';
import { CommunityMemberStatus } from 'src/modules/communities/domain/enums/community-member-status.enum';
import { TaskStatus } from 'src/modules/tasks/domain/enums/task-status.enum';

@QueryHandler(GetCommunityStatsQuery)
export class GetCommunityStatsHandler implements IQueryHandler<GetCommunityStatsQuery> {
  constructor(
    @Inject('ICommunityRepository')
    private readonly communityRepository: ICommunityRepository,
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IMeetingRepository')
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async execute(query: GetCommunityStatsQuery) {
    const community = await this.communityRepository.findById(query.communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const members = await this.memberRepository.findByCommunityId(query.communityId);
    const activeMembersCount = members.filter(m => m.status === CommunityMemberStatus.ACTIVE).length;

    // Use optimized repository methods instead of fetching everything
    const totalTasksCount = await this.taskRepository.countByClubId(community.id);
    const doneTasksCount = await this.taskRepository.countByClubId(community.id, TaskStatus.DONE);
    const activeTasksCount = totalTasksCount - doneTasksCount;

    const upcomingMeetingsCount = await this.meetingRepository.countUpcomingByClubId(community.id);

    return {
      membersCount: activeMembersCount,
      activeTasksCount,
      upcomingMeetingsCount,
    };
  }
}
