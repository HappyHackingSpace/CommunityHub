import { BaseEntity } from 'src/shared/domain/base-entity';
import { TaskTitle } from '../value-objects/task-title.vo';
import { TaskDescription } from '../value-objects/task-description.vo';
import { TaskPriority } from '../value-objects/task-priority.vo';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskVisibility } from '../enums/task-visibility.enum';
import { TaskPriority as TaskPriorityEnum } from '../enums/task-priority.enum';
import { v4 as uuidv4 } from 'uuid';

interface TaskProps {
  title: TaskTitle;
  description?: TaskDescription;
  status: TaskStatus;
  visibility: TaskVisibility;
  assignerId: string;
  assigneeId?: string;
  dueDate?: Date;
  priority: TaskPriority;
  estimatedTime?: number;
  points?: number;
  isRecurring: boolean;
  recurringSchedule?: string;
  requiredSkills?: string[];
  mentorId?: string;
  clubId?: string;
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

  get priority(): TaskPriority {
    return this.props.priority;
  }

  get estimatedTime(): number | undefined {
    return this.props.estimatedTime;
  }

  get points(): number | undefined {
    return this.props.points;
  }

  get isRecurring(): boolean {
    return this.props.isRecurring;
  }

  get recurringSchedule(): string | undefined {
    return this.props.recurringSchedule;
  }

  get requiredSkills(): string[] | undefined {
    return this.props.requiredSkills;
  }

  get mentorId(): string | undefined {
    return this.props.mentorId;
  }

  get clubId(): string | undefined {
    return this.props.clubId;
  }

  public static create(props: {
    title: string;
    description?: string;
    assignerId: string;
    assigneeId?: string;
    dueDate?: Date;
    visibility?: TaskVisibility;
    priority?: TaskPriorityEnum;
    estimatedTime?: number;
    points?: number;
    isRecurring?: boolean;
    recurringSchedule?: string;
    requiredSkills?: string[];
    mentorId?: string;
    clubId?: string;
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
      priority: props.priority
        ? TaskPriority.create(props.priority)
        : TaskPriority.create(TaskPriorityEnum.MEDIUM),
      estimatedTime: props.estimatedTime,
      points: props.points,
      isRecurring: props.isRecurring || false,
      recurringSchedule: props.recurringSchedule,
      requiredSkills: props.requiredSkills,
      mentorId: props.mentorId,
      clubId: props.clubId,
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
    priority?: TaskPriorityEnum;
    estimatedTime?: number;
    points?: number;
    requiredSkills?: string[];
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

    if (props.priority !== undefined) {
      this.props.priority = TaskPriority.create(props.priority);
    }

    if (props.estimatedTime !== undefined) {
      this.props.estimatedTime = props.estimatedTime;
    }

    if (props.points !== undefined) {
      this.props.points = props.points;
    }

    if (props.requiredSkills !== undefined) {
      this.props.requiredSkills = props.requiredSkills;
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

  public assignMentor(mentorId: string): void {
    this.props.mentorId = mentorId;
    this.updatedAt = new Date();
  }

  public removeMentor(): void {
    this.props.mentorId = undefined;
    this.updatedAt = new Date();
  }

  public isDueSoon(hoursThreshold: number = 24): boolean {
    if (!this.props.dueDate) return false;
    const now = new Date();
    const timeDiff = this.props.dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= hoursThreshold;
  }

  public isOverdue(): boolean {
    if (!this.props.dueDate) return false;
    return new Date() > this.props.dueDate;
  }

  public hasRequiredSkills(): boolean {
    return this.props.requiredSkills !== undefined && this.props.requiredSkills.length > 0;
  }

  public matchesSkills(userSkills: string[]): boolean {
    if (!this.hasRequiredSkills()) return true;
    return this.props.requiredSkills!.some(skill =>
      userSkills.some(userSkill =>
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
  }
}
