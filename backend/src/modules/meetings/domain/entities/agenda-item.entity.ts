import { BaseEntity } from '../../../../shared/domain/base-entity';

interface AgendaItemProps {
  meetingId: string;
  title: string;
  description?: string;
  duration?: number; // Duration in minutes
  order: number; // Order in the agenda list
  presenter?: string; // User ID of the presenter
}

export class AgendaItem extends BaseEntity {
  private props: AgendaItemProps;

  private constructor(
    id: string,
    props: AgendaItemProps,
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

  get description(): string | undefined {
    return this.props.description;
  }

  get duration(): number | undefined {
    return this.props.duration;
  }

  get order(): number {
    return this.props.order;
  }

  get presenter(): string | undefined {
    return this.props.presenter;
  }

  public static create(props: {
    meetingId: string;
    title: string;
    description?: string;
    duration?: number;
    order: number;
    presenter?: string;
  }): AgendaItem {
    this.validate(props);

    const agendaItemId = this.generateId();
    return new AgendaItem(agendaItemId, {
      meetingId: props.meetingId,
      title: props.title,
      description: props.description,
      duration: props.duration,
      order: props.order,
      presenter: props.presenter,
    });
  }

  public static restore(
    id: string,
    props: AgendaItemProps,
    createdAt: Date,
    updatedAt?: Date
  ): AgendaItem {
    return new AgendaItem(id, props, createdAt, updatedAt);
  }

  public update(props: {
    title?: string;
    description?: string;
    duration?: number;
    order?: number;
    presenter?: string;
  }): void {
    if (props.title !== undefined) {
      this.props.title = props.title;
    }

    if (props.description !== undefined) {
      this.props.description = props.description;
    }

    if (props.duration !== undefined) {
      this.props.duration = props.duration;
    }

    if (props.order !== undefined) {
      this.props.order = props.order;
    }

    if (props.presenter !== undefined) {
      this.props.presenter = props.presenter;
    }

    this.updatedAt = new Date();
  }

  private static validate(props: {
    title: string;
    duration?: number;
    order: number;
  }): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Agenda item title cannot be empty');
    }

    if (props.title.length > 200) {
      throw new Error('Agenda item title cannot exceed 200 characters');
    }

    if (props.duration !== undefined && props.duration < 1) {
      throw new Error('Agenda item duration must be at least 1 minute');
    }

    if (props.order < 0) {
      throw new Error('Agenda item order cannot be negative');
    }
  }

  private static generateId(): string {
    return `agenda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
