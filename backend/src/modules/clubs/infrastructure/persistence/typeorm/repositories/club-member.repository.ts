import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ClubMember } from 'src/modules/clubs/domain/entities/club-member.entity';
import { IClubMemberRepository } from 'src/modules/clubs/domain/repositories/club-member.repository.interface';
import { MembershipStatus } from 'src/modules/clubs/domain/enums/membership-status.enum';
import { ClubMemberOrmEntity } from '../entities/club-member.orm-entity';
import { ClubMemberMapper } from '../mappers/club-member.mapper';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class ClubMemberRepository implements IClubMemberRepository {
  constructor(
    @InjectRepository(ClubMemberOrmEntity)
    private readonly repository: Repository<ClubMemberOrmEntity>,
    private cls: ClsService,
  ) {}

  protected getTenantId(): string {
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Tenant context is not set');
    }
    return tenantContext.tenantId;
  }

  protected createTenantQueryBuilder(alias: string) {
    const tenantId = this.getTenantId();
    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  async create(member: ClubMember): Promise<void> {
    const ormEntity = ClubMemberMapper.toPersistence(member);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<ClubMember | null> {
    const ormEntity = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.id = :id', { id })
      .getOne();
    return ormEntity ? ClubMemberMapper.toDomain(ormEntity) : null;
  }

  async findByClubAndUser(
    clubId: string,
    userId: string,
  ): Promise<ClubMember | null> {
    const ormEntity = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.clubId = :clubId', { clubId })
      .andWhere('clubMember.userId = :userId', { userId })
      .getOne();
    return ormEntity ? ClubMemberMapper.toDomain(ormEntity) : null;
  }

  async update(member: ClubMember): Promise<void> {
    const ormEntity = ClubMemberMapper.toPersistence(member);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('clubMember')
      .delete()
      .andWhere('clubMember.id = :id', { id })
      .execute();
  }

  async findMembersByClub(clubId: string): Promise<ClubMember[]> {
    const ormEntities = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.clubId = :clubId', { clubId })
      .getMany();
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findMembersByClubAndStatus(
    clubId: string,
    status: MembershipStatus,
  ): Promise<ClubMember[]> {
    const ormEntities = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.clubId = :clubId', { clubId })
      .andWhere('clubMember.status = :status', { status })
      .getMany();
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findActiveMembersByClub(clubId: string): Promise<ClubMember[]> {
    const ormEntities = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.clubId = :clubId', { clubId })
      .andWhere('clubMember.status = :status', { status: MembershipStatus.APPROVED })
      .getMany();
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findPendingApplicationsByClub(clubId: string): Promise<ClubMember[]> {
    const ormEntities = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.clubId = :clubId', { clubId })
      .andWhere('clubMember.status = :status', { status: MembershipStatus.PENDING })
      .getMany();
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }

  async findUserClubs(userId: string): Promise<ClubMember[]> {
    const ormEntities = await this.createTenantQueryBuilder('clubMember')
      .andWhere('clubMember.userId = :userId', { userId })
      .getMany();
    return ormEntities.map((entity) => ClubMemberMapper.toDomain(entity));
  }
}
