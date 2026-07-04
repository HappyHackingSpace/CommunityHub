import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteClubCommand } from './delete-club.command';
import type { IClubRepository } from 'src/modules/clubs/domain/repositories/club.repository.interface';

@CommandHandler(DeleteClubCommand)
export class DeleteClubHandler implements ICommandHandler<DeleteClubCommand> {
  constructor(
    @Inject('IClubRepository')
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(command: DeleteClubCommand): Promise<void> {
    const club = await this.clubRepository.findById(command.clubId);
    if (!club) {
      throw new NotFoundException('Club not found');
    }

    await this.clubRepository.delete(command.clubId);
  }
}
