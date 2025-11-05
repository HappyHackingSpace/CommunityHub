import { BaseEntity } from 'src/shared/domain/base-entity';
import { TaskTitle } from '../value-objects/task-title.vo';
import { TaskDescription } from '../value-objects/task-description.vo';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskVisibility } from '../enums/task-visibility.enum';
import { v4 as uuidv4 } from 'uuid';

interface TaskProps {
  title: TaskTitle;
  description?: TaskDescription;
  status: TaskStatus;
  visibility: TaskVisibility;
  assignerId: string;
  assigneeId?: string;
  dueDate?: Date;
}

export class Task extends BaseEntity {
  private props: TaskProps;
  private domainEvents: any[] = [];

  private constructor(
    id: string,
    props: TaskProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get title(): TaskTitle {
    return this.props.title;
  }

  get description(): TaskDescription | undefined {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get visibility(): TaskVisibility {
    return this.props.visibility;
  }

  get assignerId(): string {
    return this.props.assignerId;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  // Static factory method for creation
  public static create(props: {
    title: string;
    description?: string;
    assignerId: string;
    assigneeId?: string;
    dueDate?: Date;
    visibility?: TaskVisibility;
  }): Task {
    const taskId = uuidv4();
    const task = new Task(taskId, {
      title: TaskTitle.create(props.title),
      description: props.description
        ? TaskDescription.create(props.description)
        : undefined,
      status: TaskStatus.TODO,
      visibility: props.visibility || TaskVisibility.PRIVATE,
      assignerId: props.assignerId,
      assigneeId: props.assigneeId,
      dueDate: props.dueDate,
    });

    return task;
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: TaskProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Task {
    return new Task(id, props, createdAt, updatedAt);
  }

  // Business logic methods
  public updateTask(props: {
    title?: string;
    description?: string;
    dueDate?: Date;
    visibility?: TaskVisibility;
  }): void {
    if (props.title) {
      this.props.title = TaskTitle.create(props.title);
    }

    if (props.description !== undefined) {
      this.props.description = props.description
        ? TaskDescription.create(props.description)
        : undefined;
    }

    if (props.dueDate !== undefined) {
      this.props.dueDate = props.dueDate;
    }

    if (props.visibility !== undefined) {
      this.props.visibility = props.visibility;
    }

    this.updatedAt = new Date();
  }

  public updateStatus(newStatus: TaskStatus): void {
    this.props.status = newStatus;
    this.updatedAt = new Date();
  }

  public assignTo(assigneeId: string): void {
    this.props.assigneeId = assigneeId;
    this.updatedAt = new Date();
  }

  public canBeViewedBy(userId: string): boolean {
    if (this.props.visibility === TaskVisibility.PUBLIC) {
      return true;
    }
    return (
      this.props.assignerId === userId || this.props.assigneeId === userId
    );
  }

  public canBeModifiedBy(userId: string): boolean {
    return (
      this.props.assignerId === userId || this.props.assigneeId === userId
    );
  }

  public canBeDeletedBy(userId: string): boolean {
    return this.props.assignerId === userId;
  }

  public canUpdateStatusBy(userId: string): boolean {
    return this.props.assigneeId === userId;
  }

  // Event management
  get events(): any[] {
    return [...this.domainEvents];
  }

  public clearEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }
}
