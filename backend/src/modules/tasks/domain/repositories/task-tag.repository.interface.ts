export interface ITaskTagRepository {
  attachTags(taskId: string, tagIds: string[]): Promise<void>;
  detachTag(taskId: string, tagId: string): Promise<void>;
  findTagIdsByTaskId(taskId: string): Promise<string[]>;
  findTaskIdsByTagId(tagId: string): Promise<string[]>;
  detachAllTagsFromTask(taskId: string): Promise<void>;
}
