import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateAnnouncementCommand } from './create-announcement.command';
import type { IClubAnnouncementRepository } from 'src/modules/clubs/domain/repositories/club-announcement.repository.interface';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';
import { ClubAnnouncement, AnnouncementScope } from 'src/modules/clubs/domain/entities/club-announcement.entity';

@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler
  implements ICommandHandler<CreateAnnouncementCommand>
{
  constructor(
    @Inject('IClubAnnouncementRepository')
    private readonly announcementRepository: IClubAnnouncementRepository,
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(command: CreateAnnouncementCommand): Promise<string> {
    const club = await this.clubRepository.findById(command.clubId);
    if (!club) {
      throw new NotFoundException('Club not found');
    }

    if (!club.isLeader(command.authorId)) {
      throw new ForbiddenException('Only club leaders can create announcements');
    }

    const announcement = ClubAnnouncement.create({
      clubId: command.clubId,
      authorId: command.authorId,
      title: command.title,
      content: command.content,
      scope: command.scope as AnnouncementScope,
      isPinned: command.isPinned,
    });

    await this.announcementRepository.create(announcement);

    return announcement.id;
  }
}
