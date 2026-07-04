import { AssignmentHistory } from '../../domain/entities/assignment-history.entity';

export class AssignmentHistoryResponseDto {
  id: string;
  taskId: string;
  assignedBy: string;
  assignedTo?: string;
  previousAssignee?: string;
  createdAt: Date;

  static fromDomain(history: AssignmentHistory): AssignmentHistoryResponseDto {
    return {
      id: history.id,
      taskId: history.taskId,
      assignedBy: history.assignedBy,
      assignedTo: history.assignedTo,
      previousAssignee: history.previousAssignee,
      createdAt: history.createdAt,
    };
  }
}
