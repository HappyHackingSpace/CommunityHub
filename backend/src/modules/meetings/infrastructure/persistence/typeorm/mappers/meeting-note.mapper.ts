import { MeetingNote } from '../../../../domain/entities/meeting-note.entity';
import { MeetingNoteOrmEntity } from '../entities/meeting-note.orm-entity';

export class MeetingNoteMapper {
  static toDomain(ormEntity: MeetingNoteOrmEntity): MeetingNote {
    return MeetingNote.restore(
      ormEntity.id,
      {
        meetingId: ormEntity.meetingId,
        title: ormEntity.title,
        content: ormEntity.content,
        noteType: ormEntity.noteType,
        createdBy: ormEntity.createdBy,
        isConvertedToTask: ormEntity.isConvertedToTask,
        taskId: ormEntity.taskId,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(entity: MeetingNote): MeetingNoteOrmEntity {
    const ormEntity = new MeetingNoteOrmEntity();
    ormEntity.id = entity.id;
    ormEntity.meetingId = entity.meetingId;
    ormEntity.title = entity.title;
    ormEntity.content = entity.content;
    ormEntity.noteType = entity.noteType;
    ormEntity.createdBy = entity.createdBy;
    ormEntity.isConvertedToTask = entity.isConvertedToTask;
    ormEntity.taskId = entity.taskId;
    ormEntity.createdAt = entity.createdAt;
    ormEntity.updatedAt = entity.updatedAt || entity.createdAt;
    return ormEntity;
  }
}
