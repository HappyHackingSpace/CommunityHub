export enum ApiKeyScope {
  TASKS_READ = 'tasks:read',
  TASKS_WRITE = 'tasks:write',
  TASKS_DELETE = 'tasks:delete',
  MEETINGS_READ = 'meetings:read',
  MEETINGS_WRITE = 'meetings:write',
  MEETINGS_DELETE = 'meetings:delete',
  CLUBS_READ = 'clubs:read',
  CLUBS_WRITE = 'clubs:write',
  CLUBS_MANAGE = 'clubs:manage',
  NOTIFICATIONS_READ = 'notifications:read',
  NOTIFICATIONS_SEND = 'notifications:send',
  ALL = '*',
}
