import { BaseEntity } from 'src/shared/domain/base-entity';
import { v4 as uuidv4 } from 'uuid';

interface AssignmentHistoryProps {
  taskId: string;
  assignedBy: string;
  assignedTo?: string;
  previousAssignee?: string;
}

export class AssignmentHistory extends BaseEntity {
  private props: AssignmentHistoryProps;

  private constructor(
    id: string,
    props: AssignmentHistoryProps,
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

  get assignedBy(): string {
    return this.props.assignedBy;
  }

  get assignedTo(): string | undefined {
    return this.props.assignedTo;
  }

  get previousAssignee(): string | undefined {
    return this.props.previousAssignee;
  }

  // Static factory method for creation
  public static create(props: {
    taskId: string;
    assignedBy: string;
    assignedTo?: string;
    previousAssignee?: string;
  }): AssignmentHistory {
    const historyId = uuidv4();
    return new AssignmentHistory(historyId, {
      taskId: props.taskId,
      assignedBy: props.assignedBy,
      assignedTo: props.assignedTo,
      previousAssignee: props.previousAssignee,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: AssignmentHistoryProps,
    createdAt: Date,
    updatedAt?: Date,
  ): AssignmentHistory {
    return new AssignmentHistory(id, props, createdAt, updatedAt);
  }
}
