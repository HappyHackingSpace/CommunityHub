import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AddLeaderCommand } from './add-leader.command';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';

@CommandHandler(AddLeaderCommand)
export class AddLeaderHandler implements ICommandHandler<AddLeaderCommand> {
  constructor(
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(command: AddLeaderCommand): Promise<void> {
    const club = await this.clubRepository.findById(command.clubId);
    if (!club) {
      throw new NotFoundException('Club not found');
    }

    club.addLeader(command.userId);
    await this.clubRepository.update(club);
  }
}
