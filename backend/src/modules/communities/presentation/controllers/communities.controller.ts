import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import type { ICommunityMemberRepository } from '../../domain/repositories/community-member.repository.interface';
import { JwtAuthGuard } from 'src/modules/iam/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/infrastructure/decorators/current-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { TenantOptional } from 'src/shared/decorators/tenant-optional.decorator';
import {
  CreateCommunityCommand,
  UpdateCommunityCommand,
  ApplyForMembershipCommand,
  ApproveMembershipCommand,
  RejectMembershipCommand,
} from 'src/modules/communities/application/commands';
import {
  GetCommunityQuery,
  GetAllCommunitiesQuery,
  GetCommunityMembersQuery,
  GetPendingMembershipsQuery,
  GetCommunityStatsQuery,
} from 'src/modules/communities/application/queries';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityResponseDto,
  CommunityMemberResponseDto,
} from 'src/modules/communities/application/dto';
import { Community } from 'src/modules/communities/domain/entities/community.entity';
import { CommunityMember } from 'src/modules/communities/domain/entities/community-member.entity';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('ICommunityMemberRepository')
    private readonly memberRepository: ICommunityMemberRepository,
  ) {}

  @Get()
  @Public()
  @TenantOptional()
  async getCommunities(): Promise<CommunityResponseDto[]> {
    const communities = await this.queryBus.execute(
      new GetAllCommunitiesQuery(),
    );
    return communities.map((community: Community) => this.mapCommunityToDto(community));
  }

  @Post()
  @TenantOptional()
  async createCommunity(
    @Body() dto: CreateCommunityDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ id: string; tenantId: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const tenantId = uuidv7();

    const communityId = await this.commandBus.execute(
      new CreateCommunityCommand(
        dto.name,
        dto.description,
        dto.visibility,
        userId,
        dto.logoUrl,
        dto.websiteUrl,
        tenantId,
      ),
    );

    return { id: communityId, tenantId };
  }



  @Get(':communityId')
  @TenantOptional()
  async getCommunity(
    @Param('communityId') communityId: string,
    @CurrentUser() user?: any,
  ): Promise<CommunityResponseDto> {
    const community = await this.queryBus.execute(
      new GetCommunityQuery(communityId),
    );

    if (community.visibility === 'PRIVATE' && !user) {
      return this.mapCommunityToDtoLimited(community);
    }

    if (community.visibility === 'PRIVATE' && user) {
      const isMember = await this.checkIfUserIsMember(user.id, communityId);
      if (!isMember) {
        return this.mapCommunityToDtoLimited(community);
      }
    }

    return this.mapCommunityToDto(community);
  }

  @Put(':communityId')
  @TenantOptional()
  async updateCommunity(
    @Param('communityId') communityId: string,
    @Body() dto: UpdateCommunityDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const community = await this.queryBus.execute(
      new GetCommunityQuery(communityId),
    );

    if (community.founderId !== userId) {
      throw new ForbiddenException('Only community founder can update');
    }

    await this.commandBus.execute(
      new UpdateCommunityCommand(
        communityId,
        dto.name,
        dto.description,
        dto.visibility,
        dto.logoUrl,
        dto.websiteUrl,
      ),
    );
  }

  @Post(':communityId/apply')
  @TenantOptional()
  async applyForMembership(
    @Param('communityId') communityId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const memberId = await this.commandBus.execute(
      new ApplyForMembershipCommand(communityId, userId),
    );

    return { id: memberId };
  }

  @Get(':communityId/stats')
  @TenantOptional()
  async getCommunityStats(
    @Param('communityId') communityId: string,
  ): Promise<any> {
    return this.queryBus.execute(new GetCommunityStatsQuery(communityId));
  }

  @Get(':communityId/members')
  @TenantOptional()
  async getCommunityMembers(
    @Param('communityId') communityId: string,
    @CurrentUser() user?: any,
  ): Promise<CommunityMemberResponseDto[]> {
    const community = await this.queryBus.execute(
      new GetCommunityQuery(communityId),
    );

    if (community.visibility === 'PRIVATE' && !user) {
      throw new ForbiddenException('This community is private');
    }

    if (community.visibility === 'PRIVATE' && user) {
      const isMember = await this.checkIfUserIsMember(user.id, communityId);
      if (!isMember) {
        throw new ForbiddenException('This community is private');
      }
    }

    const members = await this.queryBus.execute(
      new GetCommunityMembersQuery(communityId),
    );
    return members.map((member) => this.mapMemberToDto(member));
  }

  @Get(':communityId/pending-members')
  @TenantOptional()
  async getPendingMemberships(
    @Param('communityId') communityId: string,
    @CurrentUser('id') userId: string,
  ): Promise<CommunityMemberResponseDto[]> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const community = await this.queryBus.execute(
      new GetCommunityQuery(communityId),
    );

    if (community.founderId !== userId) {
      throw new ForbiddenException('Only community founder can view pending memberships');
    }

    const pendingMembers = await this.queryBus.execute(
      new GetPendingMembershipsQuery(communityId),
    );
    return pendingMembers.map((member) => this.mapMemberToDto(member));
  }

  @Post(':communityId/members/:memberId/approve')
  @TenantOptional()
  async approveMembership(
    @Param('communityId') communityId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const community = await this.queryBus.execute(
      new GetCommunityQuery(communityId),
    );

    if (community.founderId !== userId) {
      throw new ForbiddenException('Only community founder can approve memberships');
    }

    await this.commandBus.execute(
      new ApproveMembershipCommand(communityId, memberId, userId),
    );
  }

  @Delete(':communityId/members/:memberId/reject')
  @TenantOptional()
  async rejectMembership(
    @Param('communityId') communityId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const community = await this.queryBus.execute(
      new GetCommunityQuery(communityId),
    );

    if (community.founderId !== userId) {
      throw new ForbiddenException('Only community founder can reject memberships');
    }

    await this.commandBus.execute(
      new RejectMembershipCommand(communityId, memberId),
    );
  }

  private mapCommunityToDto(community: Community): CommunityResponseDto {
    const communityEntity = community;
    return {
      id: communityEntity.id,
      name: communityEntity.name.toString(),
      description: communityEntity.description.toString(),
      visibility: communityEntity.visibility,
      founderId: communityEntity.founderId,
      logoUrl: communityEntity.logoUrl,
      websiteUrl: communityEntity.websiteUrl,
      tenantId: communityEntity.tenantId,
      createdAt: communityEntity.createdAt,
      updatedAt: communityEntity.updatedAt,
    };
  }

  private mapMemberToDto(member: CommunityMember): CommunityMemberResponseDto {
    const memberEntity = member;
    return {
      id: memberEntity.id,
      communityId: memberEntity.communityId,
      userId: memberEntity.userId,
      status: memberEntity.status,
      appliedAt: memberEntity.appliedAt,
      approvedAt: memberEntity.approvedAt,
      approvedBy: memberEntity.approvedBy,
      createdAt: memberEntity.createdAt,
      updatedAt: memberEntity.updatedAt,
    };
  }

  private mapCommunityToDtoLimited(community: Community): CommunityResponseDto {
    const communityEntity = community;
    return {
      id: communityEntity.id,
      name: communityEntity.name.toString(),
      description: 'This is a private community', // Hide actual description
      visibility: communityEntity.visibility,
      founderId: '', // Hide founder info
      logoUrl: communityEntity.logoUrl,
      websiteUrl: undefined, // Hide website URL
      tenantId: undefined, // Hide tenant ID
      createdAt: communityEntity.createdAt,
      updatedAt: communityEntity.updatedAt,
    };
  }


  private async checkIfUserIsMember(
    userId: string,
    communityId: string,
  ): Promise<boolean> {
    const member = await this.memberRepository.findByUserId(userId);
    return member.some(m => m.communityId === communityId && m.status === 'ACTIVE');
  }
}
