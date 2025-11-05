import { BaseEntity } from 'src/shared/domain/base-entity';
import { TaskStatus } from '../enums/task-status.enum';
import { v4 as uuidv4 } from 'uuid';

interface SubTaskProps {
  parentId: string;
  title: string;
  status: TaskStatus;
}

export class SubTask extends BaseEntity {
  private props: SubTaskProps;

  private constructor(
    id: string,
    props: SubTaskProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get parentId(): string {
    return this.props.parentId;
  }

  get title(): string {
    return this.props.title;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  // Static factory method for creation
  public static create(props: { parentId: string; title: string }): SubTask {
    const subTaskId = uuidv4();
    return new SubTask(subTaskId, {
      parentId: props.parentId,
      title: props.title,
      status: TaskStatus.TODO,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: SubTaskProps,
    createdAt: Date,
    updatedAt?: Date,
  ): SubTask {
    return new SubTask(id, props, createdAt, updatedAt);
  }

  // Business logic
  public updateStatus(newStatus: TaskStatus): void {
    this.props.status = newStatus;
    this.updatedAt = new Date();
  }
}
