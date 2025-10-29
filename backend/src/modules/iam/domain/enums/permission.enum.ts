// src/modules/iam/domain/enums/permission.enum.ts
export enum Permission {
  // User Management
  USER_VIEW_ALL = 'user.view.all',
  USER_VIEW_OWN = 'user.view.own',
  USER_UPDATE_OWN = 'user.update.own',
  USER_UPDATE_ANY = 'user.update.any',
  USER_DELETE_ANY = 'user.delete.any',

  // Role Management
  ROLE_ASSIGN = 'role.assign',
  ROLE_REMOVE = 'role.remove',
  ROLE_VIEW = 'role.view',

  // Meeting Management (gelecek için)
  MEETING_CREATE = 'meeting.create',
  MEETING_UPDATE_OWN = 'meeting.update.own',
  MEETING_UPDATE_ANY = 'meeting.update.any',
  MEETING_DELETE_OWN = 'meeting.delete.own',
  MEETING_DELETE_ANY = 'meeting.delete.any',
  MEETING_VIEW = 'meeting.view',
  MEETING_JOIN = 'meeting.join',

  // Community Management (gelecek için)
  COMMUNITY_MANAGE = 'community.manage',
}