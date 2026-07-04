import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateProfileCommand } from './update-profile.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Inject, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.updateProfile(command.displayName, command.avatarUrl, command.bio);

    const updatedUser = await this.userRepository.update(user);

    user.events.forEach(event => this.eventBus.publish(event));
    user.clearEvents();

    return updatedUser;
  }
}
