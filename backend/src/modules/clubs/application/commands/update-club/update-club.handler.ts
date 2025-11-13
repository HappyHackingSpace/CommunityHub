import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateClubCommand } from './update-club.command';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';

@CommandHandler(UpdateClubCommand)
export class UpdateClubHandler implements ICommandHandler<UpdateClubCommand> {
  constructor(
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(command: UpdateClubCommand): Promise<void> {
    const club = await this.clubRepository.findById(command.clubId);
    if (!club) {
      throw new NotFoundException('Club not found');
    }

    club.update({
      name: command.name,
      description: command.description,
      logoUrl: command.logoUrl,
      visibility: command.visibility,
      manifesto: command.manifesto,
      slackUrl: command.slackUrl,
      discordUrl: command.discordUrl,
      darkThemeEnabled: command.darkThemeEnabled,
    });

    await this.clubRepository.update(club);
  }
}
