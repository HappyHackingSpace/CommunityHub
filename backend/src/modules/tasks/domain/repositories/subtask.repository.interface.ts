import { SubTask } from '../entities/subtask.entity';

export interface ISubTaskRepository {
  save(subTask: SubTask): Promise<SubTask>;
  findById(id: string): Promise<SubTask | null>;
  findByParentId(parentId: string): Promise<SubTask[]>;
  update(subTask: SubTask): Promise<SubTask>;
  delete(id: string): Promise<void>;
}
