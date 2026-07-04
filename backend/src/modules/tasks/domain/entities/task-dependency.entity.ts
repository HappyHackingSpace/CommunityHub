import { BaseEntity } from 'src/shared/domain/base-entity';
import { v4 as uuidv4 } from 'uuid';

interface TaskDependencyProps {
  taskId: string; // The task that depends on another
  dependsOnTaskId: string; // The task that must be completed first
}

export class TaskDependency extends BaseEntity {
  private props: TaskDependencyProps;

  private constructor(
    id: string,
    props: TaskDependencyProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get taskId(): string {
    return this.props.taskId;
  }

  get dependsOnTaskId(): string {
    return this.props.dependsOnTaskId;
  }

  // Static factory method for creation
  public static create(props: {
    taskId: string;
    dependsOnTaskId: string;
  }): TaskDependency {
    if (props.taskId === props.dependsOnTaskId) {
      throw new Error('A task cannot depend on itself');
    }

    const dependencyId = uuidv4();
    return new TaskDependency(dependencyId, {
      taskId: props.taskId,
      dependsOnTaskId: props.dependsOnTaskId,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: TaskDependencyProps,
    createdAt: Date,
    updatedAt?: Date,
  ): TaskDependency {
    return new TaskDependency(id, props, createdAt, updatedAt);
  }
}
