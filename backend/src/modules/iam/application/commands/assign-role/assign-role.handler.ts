// src/modules/iam/application/commands/assign-role/assign-role.handler.ts
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AssignRoleCommand } from './assign-role.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { RoleType } from '../../../domain/enums/role-type.enum';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserAuthorizationService } from 'src/modules/iam/domain/services/user-authorization.service';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AssignRoleCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const admin = await this.userRepository.findById(command.assignedBy);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const roleToAssign = command.role as RoleType;
    if (!UserAuthorizationService.canAssignRole(admin, roleToAssign)) {
      throw new ForbiddenException('You do not have permission to assign this role');
    }

    user.assignRole(roleToAssign, command.assignedBy);

    const updatedUser = await this.userRepository.update(user);

    user.events.forEach(event => this.eventBus.publish(event));
    user.clearEvents();

    return updatedUser;
  }
}