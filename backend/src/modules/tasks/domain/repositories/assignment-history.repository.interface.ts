import { AssignmentHistory } from '../entities/assignment-history.entity';

export interface IAssignmentHistoryRepository {
  save(history: AssignmentHistory): Promise<AssignmentHistory>;
  findByTaskId(taskId: string): Promise<AssignmentHistory[]>;
  delete(id: string): Promise<void>;
}
