import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { IMeetingRepository } from '../../../../domain/repositories/meeting.repository.interface';
import { Meeting } from '../../../../domain/entities/meeting.entity';
import { MeetingOrmEntity } from '../entities/meeting.orm-entity';
import { MeetingMapper } from '../mappers/meeting.mapper';
import { MeetingStatus } from '../../../../domain/enums/meeting-status.enum';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';

@Injectable()
export class MeetingRepository implements IMeetingRepository {
  constructor(
    @InjectRepository(MeetingOrmEntity)
    private readonly repository: Repository<MeetingOrmEntity>,
    private cls: ClsService,
  ) {}

  protected getTenantId(): number {
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

  async save(meeting: Meeting): Promise<Meeting> {
    const ormEntity = MeetingMapper.toPersistence(meeting);
    const tenantId = this.getTenantId();
    (ormEntity as any).tenantId = tenantId;
    const saved = await this.repository.save(ormEntity);
    return MeetingMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Meeting | null> {
    const ormEntity = await this.createTenantQueryBuilder('meeting')
      .andWhere('meeting.id = :id', { id })
      .leftJoinAndSelect('meeting.participants', 'participants')
      .getOne();
    return ormEntity ? MeetingMapper.toDomain(ormEntity) : null;
  }

  async findByOrganizerId(organizerId: string): Promise<Meeting[]> {
    const ormEntities = await this.createTenantQueryBuilder('meeting')
      .andWhere('meeting.organizerId = :organizerId', { organizerId })
      .leftJoinAndSelect('meeting.participants', 'participants')
      .orderBy('meeting.startTime', 'ASC')
      .getMany();
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findByParticipantId(participantId: string): Promise<Meeting[]> {
    const ormEntities = await this.createTenantQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participant')
      .andWhere('participant.userId = :participantId', { participantId })
      .orderBy('meeting.startTime', 'ASC')
      .getMany();

    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findUpcoming(userId: string): Promise<Meeting[]> {
    const now = new Date();

    const ormEntities = await this.createTenantQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participant')
      .andWhere(
        '(meeting.organizerId = :userId OR participant.userId = :userId) AND meeting.startTime > :now AND meeting.status IN (:...statuses)',
        {
          userId,
          now,
          statuses: [MeetingStatus.SCHEDULED, MeetingStatus.IN_PROGRESS],
        }
      )
      .orderBy('meeting.startTime', 'ASC')
      .getMany();

    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Meeting[]> {
    const ormEntities = await this.createTenantQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participant')
      .andWhere('meeting.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('meeting.startTime', 'ASC')
      .getMany();

    return ormEntities.map(MeetingMapper.toDomain);
  }

  async findAll(): Promise<Meeting[]> {
    const ormEntities = await this.createTenantQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .orderBy('meeting.startTime', 'DESC')
      .getMany();
    return ormEntities.map(MeetingMapper.toDomain);
  }

  async update(meeting: Meeting): Promise<Meeting> {
    const existingOrm = await this.createTenantQueryBuilder('meeting')
      .andWhere('meeting.id = :id', { id: meeting.id })
      .leftJoinAndSelect('meeting.participants', 'participants')
      .getOne();

    if (!existingOrm) {
      throw new Error('Meeting not found');
    }

    const updatedOrm = MeetingMapper.toOrmForUpdate(meeting, existingOrm);
    const saved = await this.repository.save(updatedOrm);
    return MeetingMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.createTenantQueryBuilder('meeting')
      .delete()
      .andWhere('meeting.id = :id', { id })
      .execute();
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.createTenantQueryBuilder('meeting')
      .andWhere('meeting.id = :id', { id })
      .getCount();
    return count > 0;
  }
}