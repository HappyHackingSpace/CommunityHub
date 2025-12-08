import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ClubOrmEntity } from 'src/modules/clubs/infrastructure/persistence/typeorm/entities/club.orm-entity';
import { ClubMemberOrmEntity } from 'src/modules/clubs/infrastructure/persistence/typeorm/entities/club-member.orm-entity';
import { ClubRoleOrmEntity } from 'src/modules/clubs/infrastructure/persistence/typeorm/entities/club-role.orm-entity';

export interface TenantProvisioningRequest {
  clubName: string;
  clubDescription: string;
  createdByUserId: string;
  maxMembers?: number;
  tier?: string;
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    @InjectRepository(ClubOrmEntity)
    private clubRepository: Repository<ClubOrmEntity>,
    @InjectRepository(ClubMemberOrmEntity)
    private clubMemberRepository: Repository<ClubMemberOrmEntity>,
    @InjectRepository(ClubRoleOrmEntity)
    private clubRoleRepository: Repository<ClubRoleOrmEntity>,
    private dataSource: DataSource,
  ) {}

  async provisionNewTenant(request: TenantProvisioningRequest): Promise<{
    tenantId: number;
    clubId: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenantId = await this.generateUniqueTenantId(queryRunner);
      this.logger.log(`Generated tenant_id: ${tenantId}`);

      const club = await queryRunner.manager.save(ClubOrmEntity, {
        id: this.generateId(),
        tenantId,
        name: request.clubName,
        description: request.clubDescription,
        createdByUserId: request.createdByUserId,
        visibility: 'PRIVATE',
        isActive: true,
        tier: request.tier || 'free',
        maxMembers: request.maxMembers || 50,
        leaders: [request.createdByUserId],
      });

      this.logger.log(`Created club: ${club.id} with tenant_id: ${tenantId}`);

      const roles = await this.createDefaultRoles(queryRunner, tenantId, club.id);
      const adminRole = roles.find(r => r.name === 'admin');
      
      if (!adminRole) {
        throw new Error('Admin role not found after creating default roles');
      }

      const clubMember = await queryRunner.manager.save(ClubMemberOrmEntity, {
        id: this.generateId(),
        tenantId,
        clubId: club.id,
        userId: request.createdByUserId,
        roleId: adminRole.id,
        status: 'APPROVED',
        joinedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: request.createdByUserId,
      });

      this.logger.log(
        `Added creator as admin: ${clubMember.id} in club: ${club.id}`,
      );

      await queryRunner.commitTransaction();

      this.logger.log(`Tenant provisioning complete. TenantId: ${tenantId}`);

      return {
        tenantId,
        clubId: club.id,
      };
    } catch (error) {
      this.logger.error(`Tenant provisioning failed: ${error.message}`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateUniqueTenantId(queryRunner: any): Promise<number> {
    const result = await queryRunner.query(
      'SELECT MAX(tenant_id) as max_id FROM clubs',
    );
    const maxTenantId = result[0]?.max_id || 1000000;
    return maxTenantId + 1;
  }

  private async createDefaultRoles(
    queryRunner: any,
    tenantId: number,
    clubId: string,
  ): Promise<ClubRoleOrmEntity[]> {
    const roles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        permissions: ['*'],
      },
      {
        name: 'lead',
        displayName: 'Club Lead',
        permissions: [
          'manage_members',
          'create_tasks',
          'create_meetings',
          'manage_club',
        ],
      },
      {
        name: 'member',
        displayName: 'Member',
        permissions: ['view_tasks', 'participate_meetings', 'create_tasks'],
      },
      {
        name: 'guest',
        displayName: 'Guest',
        permissions: ['view_tasks', 'view_meetings'],
      },
    ];

    const createdRoles: ClubRoleOrmEntity[] = [];

    for (const roleData of roles) {
      const role = await queryRunner.manager.save(ClubRoleOrmEntity, {
        id: this.generateId(),
        clubId,
        tenantId,
        name: roleData.name,
        displayName: roleData.displayName,
        permissions: roleData.permissions,
        isSystemRole: true,
      });
      createdRoles.push(role);
    }

    return createdRoles;
  }

  private generateId(): string {
    return uuidv4();
  }
}
