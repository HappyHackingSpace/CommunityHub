import { BaseEntity } from 'src/shared/domain/base-entity';
import { ActivityAction } from '../enums/activity-action.enum';
import { v4 as uuidv4 } from 'uuid';

interface ActivityLogProps {
  taskId: string;
  userId: string;
  action: ActivityAction;
  details?: string;
}

export class ActivityLog extends BaseEntity {
  private props: ActivityLogProps;

  private constructor(
    id: string,
    props: ActivityLogProps,
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

  get userId(): string {
    return this.props.userId;
  }

  get action(): ActivityAction {
    return this.props.action;
  }

  get details(): string | undefined {
    return this.props.details;
  }

  // Static factory method for creation
  public static create(props: {
    taskId: string;
    userId: string;
    action: ActivityAction;
    details?: Record<string, any>;
  }): ActivityLog {
    const logId = uuidv4();
    return new ActivityLog(logId, {
      taskId: props.taskId,
      userId: props.userId,
      action: props.action,
      details: props.details ? JSON.stringify(props.details) : undefined,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: ActivityLogProps,
    createdAt: Date,
    updatedAt?: Date,
  ): ActivityLog {
    return new ActivityLog(id, props, createdAt, updatedAt);
  }

  // Helper to parse details
  public getParsedDetails(): Record<string, any> | null {
    if (!this.props.details) return null;
    try {
      return JSON.parse(this.props.details);
    } catch {
      return null;
    }
  }
}
