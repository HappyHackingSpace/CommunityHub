import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BanUserCommand } from './ban-user.command';
import { UserBan } from 'src/modules/security-moderation/domain/entities/user-ban.entity';
import type { IUserBanRepository } from 'src/modules/security-moderation/domain/repositories/user-ban.repository.interface';

@CommandHandler(BanUserCommand)
export class BanUserHandler implements ICommandHandler<BanUserCommand> {
  constructor(
    @Inject('IUserBanRepository')
    private readonly repository: IUserBanRepository,
  ) {}

  async execute(command: BanUserCommand): Promise<string> {
    const ban = UserBan.create({
      userId: command.userId,
      action: command.action,
      reason: command.reason,
      moderatorId: command.moderatorId,
      banUntil: command.banUntil,
    });

    await this.repository.save(ban);
    return ban.id;
  }
}
