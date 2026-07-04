export enum Permission {
  CREATE_TASK = 'can_create_task',
  DELETE_ANY_POST = 'can_delete_any_post',
  EDIT_ANY_POST = 'can_edit_any_post',
  VIEW_REPORTS = 'can_view_reports',
  MANAGE_REPORTS = 'can_manage_reports',
  BAN_USERS = 'can_ban_users',
  SUSPEND_USERS = 'can_suspend_users',
  DELETE_CONTENT = 'can_delete_content',
  HIDE_CONTENT = 'can_hide_content',
  WARN_USERS = 'can_warn_users',
  MANAGE_ROLES = 'can_manage_roles',
  VIEW_AUDIT_LOG = 'can_view_audit_log',
  ACCESS_ADMIN_PANEL = 'can_access_admin_panel',
}

export class PermissionSet {
  private constructor(private permissions: Set<Permission>) {}

  static create(permissions: Permission[]): PermissionSet {
    return new PermissionSet(new Set(permissions));
  }

  static empty(): PermissionSet {
    return new PermissionSet(new Set());
  }

  has(permission: Permission): boolean {
    return this.permissions.has(permission);
  }

  add(permission: Permission): void {
    this.permissions.add(permission);
  }

  remove(permission: Permission): void {
    this.permissions.delete(permission);
  }

  getAll(): Permission[] {
    return Array.from(this.permissions);
  }

  toJSON(): Permission[] {
    return this.getAll();
  }
}
