import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/modules/iam/infrastructure/guards/flexible-auth.guard';
import { ScopesGuard } from 'src/modules/iam/infrastructure/guards/scopes.guard';
import { ApiKeyThrottlerGuard } from 'src/modules/iam/infrastructure/guards/api-key-throttler.guard';
import { RequireScopes } from 'src/modules/iam/infrastructure/decorators/require-scopes.decorator';
import { TenantAccessGuard } from 'src/shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from 'src/shared/guards/tenant-context-complete.guard';
import { CurrentUser } from 'src/shared/infrastructure/decorators/current-user.decorator';
import { CreateClubDto } from 'src/modules/clubs/application/dto/create-club.dto';
import { UpdateClubDto } from 'src/modules/clubs/application/dto/update-club.dto';
import { ClubResponseDto } from 'src/modules/clubs/application/dto/club-response.dto';
import { AddMemberDto } from 'src/modules/clubs/application/dto/add-member.dto';
import { CreateAnnouncementDto } from 'src/modules/clubs/application/dto/create-announcement.dto';
import { ClubMemberResponseDto } from 'src/modules/clubs/application/dto/club-member-response.dto';
import { CreateClubCommand } from 'src/modules/clubs/application/commands/create-club/create-club.command';
import { UpdateClubCommand } from 'src/modules/clubs/application/commands/update-club/update-club.command';
import { DeleteClubCommand } from 'src/modules/clubs/application/commands/delete-club/delete-club.command';
import { AddMemberCommand } from 'src/modules/clubs/application/commands/add-member/add-member.command';
import { ApplyForMembershipCommand } from 'src/modules/clubs/application/commands/apply-for-membership/apply-for-membership.command';
import { ApproveMemberApplicationCommand } from 'src/modules/clubs/application/commands/approve-member-application/approve-member-application.command';
import { RemoveMemberCommand } from 'src/modules/clubs/application/commands/remove-member/remove-member.command';
import { CreateAnnouncementCommand } from 'src/modules/clubs/application/commands/create-announcement/create-announcement.command';
import { GetClubQuery } from 'src/modules/clubs/application/queries/get-club/get-club.query';
import { GetAllClubsQuery } from 'src/modules/clubs/application/queries/get-all-clubs/get-all-clubs.query';
import { GetClubMembersQuery } from 'src/modules/clubs/application/queries/get-club-members/get-club-members.query';
import { GetClubAnnouncementsQuery } from 'src/modules/clubs/application/queries/get-club-announcements/get-club-announcements.query';
import { GetPendingApplicationsQuery } from 'src/modules/clubs/application/queries/get-pending-applications/get-pending-applications.query';
import { ClubMapper } from 'src/modules/clubs/infrastructure/persistence/typeorm/mappers/club.mapper';
import { ClubMemberMapper } from 'src/modules/clubs/infrastructure/persistence/typeorm/mappers/club-member.mapper';
import { ClubAnnouncementMapper } from 'src/modules/clubs/infrastructure/persistence/typeorm/mappers/club-announcement.mapper';

@ApiTags('clubs')
@ApiBearerAuth()
@Controller('clubs')
@UseGuards(FlexibleAuthGuard, ScopesGuard, TenantContextCompleteGuard, TenantAccessGuard, ApiKeyThrottlerGuard)
export class ClubsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequireScopes('clubs:write')
  async createClub(
    @Body() dto: CreateClubDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const clubId = await this.commandBus.execute(
      new CreateClubCommand(
        dto.name,
        dto.description,
        userId,
        dto.logoUrl,
        dto.visibility,
        dto.manifesto,
        dto.slackUrl,
        dto.discordUrl,
      ),
    );

    return { id: clubId };
  }

  @Get()
  @RequireScopes('clubs:read')
  async getAllClubs(): Promise<ClubResponseDto[]> {
    const clubs = await this.queryBus.execute(new GetAllClubsQuery());
    return clubs.map((club) => this.mapClubToDto(club));
  }

  @Get(':clubId')
  @RequireScopes('clubs:read')
  async getClub(@Param('clubId') clubId: string): Promise<ClubResponseDto> {
    const club = await this.queryBus.execute(new GetClubQuery(clubId));
    return this.mapClubToDto(club);
  }

  @Put(':clubId')
  @RequireScopes('clubs:write')
  async updateClub(
    @Param('clubId') clubId: string,
    @Body() dto: UpdateClubDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateClubCommand(
        clubId,
        dto.name,
        dto.description,
        dto.logoUrl,
        dto.visibility,
        dto.manifesto,
        dto.slackUrl,
        dto.discordUrl,
        dto.darkThemeEnabled,
      ),
    );
  }

  @Delete(':clubId')
  @RequireScopes('clubs:manage')
  async deleteClub(@Param('clubId') clubId: string): Promise<void> {
    await this.commandBus.execute(new DeleteClubCommand(clubId));
  }

  @Post(':clubId/members')
  @RequireScopes('clubs:manage')
  async addMember(
    @Param('clubId') clubId: string,
    @Body() dto: AddMemberDto,
  ): Promise<{ id: string }> {
    const memberId = await this.commandBus.execute(
      new AddMemberCommand(clubId, dto.userId, dto.roleId),
    );
    return { id: memberId };
  }

  @Post(':clubId/apply')
  @RequireScopes('clubs:write')
  async applyForMembership(
    @Param('clubId') clubId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const memberId = await this.commandBus.execute(
      new ApplyForMembershipCommand(clubId, userId),
    );
    return { id: memberId };
  }

  @Get(':clubId/members')
  @RequireScopes('clubs:read')
  async getClubMembers(
    @Param('clubId') clubId: string,
  ): Promise<ClubMemberResponseDto[]> {
    const members = await this.queryBus.execute(
      new GetClubMembersQuery(clubId),
    );
    return members.map((member) => this.mapMemberToDto(member));
  }

  @Get(':clubId/pending-applications')
  @RequireScopes('clubs:manage')
  async getPendingApplications(
    @Param('clubId') clubId: string,
  ): Promise<ClubMemberResponseDto[]> {
    const members = await this.queryBus.execute(
      new GetPendingApplicationsQuery(clubId),
    );
    return members.map((member) => this.mapMemberToDto(member));
  }

  @Post(':clubId/members/:memberId/approve')
  @RequireScopes('clubs:manage')
  async approveMemberApplication(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    await this.commandBus.execute(
      new ApproveMemberApplicationCommand(clubId, memberId, userId),
    );
  }

  @Delete(':clubId/members/:memberId')
  @RequireScopes('clubs:manage')
  async removeMember(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveMemberCommand(clubId, memberId));
  }

  @Post(':clubId/announcements')
  @RequireScopes('clubs:write')
  async createAnnouncement(
    @Param('clubId') clubId: string,
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const announcementId = await this.commandBus.execute(
      new CreateAnnouncementCommand(
        clubId,
        userId,
        dto.title,
        dto.content,
        dto.scope,
        dto.isPinned,
      ),
    );
    return { id: announcementId };
  }

  @Get(':clubId/announcements')
  @RequireScopes('clubs:read')
  async getClubAnnouncements(
    @Param('clubId') clubId: string,
  ): Promise<any[]> {
    const announcements = await this.queryBus.execute(
      new GetClubAnnouncementsQuery(clubId),
    );
    return announcements.map((announcement) =>
      this.mapAnnouncementToDto(announcement),
    );
  }

  private mapClubToDto(club: any): ClubResponseDto {
    const clubEntity = ClubMapper.toDomain(club);
    return {
      id: clubEntity.id,
      name: clubEntity.name.toString(),
      description: clubEntity.description.toString(),
      logoUrl: clubEntity.logoUrl,
      visibility: clubEntity.visibility,
      leaders: clubEntity.leaders,
      manifesto: clubEntity.manifesto?.toString(),
      slackUrl: clubEntity.slackUrl,
      discordUrl: clubEntity.discordUrl,
      darkThemeEnabled: clubEntity.darkThemeEnabled,
      totalTasksCompleted: clubEntity.totalTasksCompleted,
      totalMeetingsHeld: clubEntity.totalMeetingsHeld,
      createdAt: clubEntity.createdAt,
      updatedAt: clubEntity.updatedAt,
    };
  }

  private mapMemberToDto(member: any): ClubMemberResponseDto {
    const memberEntity = ClubMemberMapper.toDomain(member);
    return {
      id: memberEntity.id,
      clubId: memberEntity.clubId,
      userId: memberEntity.userId,
      roleId: memberEntity.roleId,
      status: memberEntity.status,
      joinedAt: memberEntity.joinedAt,
      appliedAt: memberEntity.appliedAt,
      approvedAt: memberEntity.approvedAt,
      approvedBy: memberEntity.approvedBy,
      createdAt: memberEntity.createdAt,
      updatedAt: memberEntity.updatedAt,
    };
  }

  private mapAnnouncementToDto(announcement: any): any {
    const announcementEntity = ClubAnnouncementMapper.toDomain(announcement);
    return {
      id: announcementEntity.id,
      clubId: announcementEntity.clubId,
      authorId: announcementEntity.authorId,
      title: announcementEntity.title,
      content: announcementEntity.content,
      scope: announcementEntity.scope,
      isPinned: announcementEntity.isPinned,
      createdAt: announcementEntity.createdAt,
      updatedAt: announcementEntity.updatedAt,
    };
  }
}
