import { BaseEntity } from '../../../../shared/domain/base-entity';

interface MeetingNoteProps {
  meetingId: string;
  title: string;
  content: string;
  noteType: 'note' | 'decision' | 'action_item';
  createdBy: string; // User ID
  isConvertedToTask: boolean;
  taskId?: string; // Reference to the created task if converted
}

export class MeetingNote extends BaseEntity {
  private props: MeetingNoteProps;

  private constructor(
    id: string,
    props: MeetingNoteProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get meetingId(): string {
    return this.props.meetingId;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get noteType(): 'note' | 'decision' | 'action_item' {
    return this.props.noteType;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get isConvertedToTask(): boolean {
    return this.props.isConvertedToTask;
  }

  get taskId(): string | undefined {
    return this.props.taskId;
  }

  public static create(props: {
    meetingId: string;
    title: string;
    content: string;
    noteType: 'note' | 'decision' | 'action_item';
    createdBy: string;
  }): MeetingNote {
    this.validate(props);

    const noteId = this.generateId();
    return new MeetingNote(noteId, {
      meetingId: props.meetingId,
      title: props.title,
      content: props.content,
      noteType: props.noteType,
      createdBy: props.createdBy,
      isConvertedToTask: false,
    });
  }

  public static restore(
    id: string,
    props: MeetingNoteProps,
    createdAt: Date,
    updatedAt?: Date
  ): MeetingNote {
    return new MeetingNote(id, props, createdAt, updatedAt);
  }

  public update(props: {
    title?: string;
    content?: string;
    noteType?: 'note' | 'decision' | 'action_item';
  }): void {
    if (props.title !== undefined) {
      if (!props.title || props.title.trim().length === 0) {
        throw new Error('Note title cannot be empty');
      }
      this.props.title = props.title;
    }

    if (props.content !== undefined) {
      if (!props.content || props.content.trim().length === 0) {
        throw new Error('Note content cannot be empty');
      }
      this.props.content = props.content;
    }

    if (props.noteType !== undefined) {
      this.props.noteType = props.noteType;
    }

    this.updatedAt = new Date();
  }

  public markAsConvertedToTask(taskId: string): void {
    if (this.props.isConvertedToTask) {
      throw new Error('Note has already been converted to a task');
    }

    this.props.isConvertedToTask = true;
    this.props.taskId = taskId;
    this.updatedAt = new Date();
  }

  private static validate(props: {
    title: string;
    content: string;
  }): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Note title cannot be empty');
    }

    if (props.title.length > 200) {
      throw new Error('Note title cannot exceed 200 characters');
    }

    if (!props.content || props.content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }
  }

  private static generateId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
