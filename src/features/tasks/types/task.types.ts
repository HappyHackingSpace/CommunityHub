// Task Types - Backend API'ye uygun

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  assignerId: string;
  clubId?: string;
  tags?: TaskTag[];
  comments?: TaskComment[];
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskTag {
  id: string;
  name: string;
  color?: string;
}

export interface TaskComment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  clubId?: string;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  status?: TaskStatus;
}

export interface AssignTaskDto {
  assigneeId: string;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

export interface CreateCommentDto {
  content: string;
}

export interface CreateSubtaskDto {
  title: string;
}

export interface UpdateSubtaskStatusDto {
  status: TaskStatus;
}

export interface TaskSearchParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface TaskSearchResponse {
  data: TaskResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
