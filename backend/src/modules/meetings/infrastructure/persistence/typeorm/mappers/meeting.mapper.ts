import { Meeting } from '../../../../domain/entities/meeting.entity';
import { MeetingOrmEntity } from '../entities/meeting.orm-entity';
import { ParticipantOrmEntity } from '../entities/participant.orm-entity';
import { MeetingTitle } from '../../../../domain/value-objects/meeting-title.vo';
import { MeetingDuration } from '../../../../domain/value-objects/meeting-duration.vo';

export class MeetingMapper {
  static toPersistence(meeting: Meeting): MeetingOrmEntity {
    const ormEntity = new MeetingOrmEntity();
    
    ormEntity.id = meeting.id;
    ormEntity.title = meeting.title.value;
    ormEntity.description = meeting.description;
    ormEntity.startTime = meeting.startTime;
    ormEntity.durationMinutes = meeting.duration.minutes;
    ormEntity.organizerId = meeting.organizerId;
    ormEntity.status = meeting.status;
    ormEntity.meetingUrl = meeting.meetingUrl;
    ormEntity.createdAt = meeting.createdAt;
    ormEntity.updatedAt = meeting.updatedAt;

    // Map participants
    ormEntity.participants = meeting.participants.map(participant => {
      const participantOrm = new ParticipantOrmEntity();
      participantOrm.meetingId = meeting.id;
      participantOrm.userId = participant.userId;
      participantOrm.status = participant.status;
      participantOrm.joinedAt = participant.joinedAt;
      return participantOrm;
    });

    return ormEntity;
  }

  static toDomain(ormEntity: MeetingOrmEntity): Meeting {
    const title = MeetingTitle.create(ormEntity.title);
    const duration = MeetingDuration.create(ormEntity.durationMinutes);

    const participants = ormEntity.participants?.map(p => ({
      userId: p.userId,
      status: p.status,
      joinedAt: p.joinedAt,
    })) || [];

    return Meeting.restore(
      ormEntity.id,
      {
        title,
        description: ormEntity.description,
        startTime: ormEntity.startTime,
        duration,
        organizerId: ormEntity.organizerId,
        participants,
        status: ormEntity.status,
        meetingUrl: ormEntity.meetingUrl,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrmForUpdate(meeting: Meeting, existingOrm: MeetingOrmEntity): MeetingOrmEntity {
    existingOrm.title = meeting.title.value;
    existingOrm.description = meeting.description;
    existingOrm.startTime = meeting.startTime;
    existingOrm.durationMinutes = meeting.duration.minutes;
    existingOrm.status = meeting.status;
    existingOrm.meetingUrl = meeting.meetingUrl;
    existingOrm.updatedAt = meeting.updatedAt;

    // Update participants - clear existing and add new ones
    existingOrm.participants = meeting.participants.map(participant => {
      // Try to find existing participant
      const existingParticipant = existingOrm.participants?.find(
        p => p.userId === participant.userId
      );

      if (existingParticipant) {
        existingParticipant.status = participant.status;
        existingParticipant.joinedAt = participant.joinedAt;
        return existingParticipant;
      } else {
        const newParticipant = new ParticipantOrmEntity();
        newParticipant.meetingId = meeting.id;
        newParticipant.userId = participant.userId;
        newParticipant.status = participant.status;
        newParticipant.joinedAt = participant.joinedAt;
        return newParticipant;
      }
    });

    return existingOrm;
  }
}