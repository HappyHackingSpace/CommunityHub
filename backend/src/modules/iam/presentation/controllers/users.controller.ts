// src/modules/iam/presentation/controllers/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { RoleType } from '../../domain/enums/role-type.enum';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { AssignRoleCommand } from '../../application/commands/assign-role/assign-role.command';
import { AssignRoleDto } from '../../application/dto/assign-role.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() currentUser) {
    const user = await this.queryBus.execute(
      new GetUserQuery(currentUser.userId),
    );
    return UserResponseDto.fromDomain(user);
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  async getUser(@Param('id') id: string) {
    const user = await this.queryBus.execute(new GetUserQuery(id));
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id/roles')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  async assignRole(
    @Param('id') userId: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() currentUser,
  ) {
    const user = await this.commandBus.execute(
      new AssignRoleCommand(userId, dto.role, currentUser.userId),
    );
    return UserResponseDto.fromDomain(user);
  }
}