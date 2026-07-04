import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from './register-user.command';
import { User } from '../../../domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import type { IUserRepository } from 'src/modules/iam/domain/repositories/user.repository.interface';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const existingUser = await this.userRepository.findByGoogleId(command.googleId);
    
    if (existingUser) {
      return existingUser;
    }

    const user = User.create(
      command.googleId,
      command.email,
      command.displayName,
      command.avatarUrl,
    );

    const savedUser = await this.userRepository.save(user);

    user.events.forEach(event => this.eventBus.publish(event));
    user.clearEvents();

    return savedUser;
  }
}