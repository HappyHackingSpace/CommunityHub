import { User } from '../entities/user.entity';
import { Permission } from '../enums/permission.enum';
import { RoleType } from '../enums/role-type.enum';

export class UserAuthorizationService {
  private static readonly ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
    [RoleType.SUPER_ADMIN]: [
      ...Object.values(Permission),
    ],
    [RoleType.ADMIN]: [
      Permission.USER_VIEW_ALL,
      Permission.USER_UPDATE_ANY,
      Permission.USER_DELETE_ANY,
      Permission.ROLE_ASSIGN,
      Permission.ROLE_REMOVE,
      Permission.ROLE_VIEW,
      Permission.MEETING_CREATE,
      Permission.MEETING_UPDATE_ANY,
      Permission.MEETING_DELETE_ANY,
      Permission.MEETING_VIEW,
      Permission.MEETING_JOIN,
      Permission.COMMUNITY_MANAGE,
    ],
    [RoleType.FOUNDER]: [
      Permission.USER_VIEW_OWN,
      Permission.USER_UPDATE_OWN,
      Permission.MEETING_CREATE,
      Permission.MEETING_UPDATE_OWN,
      Permission.MEETING_DELETE_OWN,
      Permission.MEETING_VIEW,
      Permission.MEETING_JOIN,
      Permission.COMMUNITY_MANAGE,
    ],
    [RoleType.ORGANIZER]: [
      Permission.USER_VIEW_OWN,
      Permission.USER_UPDATE_OWN,
      Permission.MEETING_CREATE,
      Permission.MEETING_UPDATE_OWN,
      Permission.MEETING_DELETE_OWN,
      Permission.MEETING_VIEW,
      Permission.MEETING_JOIN,
    ],
    [RoleType.MENTOR]: [
      Permission.USER_VIEW_OWN,
      Permission.USER_UPDATE_OWN,
      Permission.MEETING_CREATE,
      Permission.MEETING_UPDATE_OWN,
      Permission.MEETING_VIEW,
      Permission.MEETING_JOIN,
    ],
    [RoleType.MEMBER]: [
      Permission.USER_VIEW_OWN,
      Permission.USER_UPDATE_OWN,
      Permission.MEETING_VIEW,
      Permission.MEETING_JOIN,
    ],
    [RoleType.GUEST]: [
      Permission.USER_VIEW_OWN,
      Permission.MEETING_VIEW,
    ],
  };

  public static hasPermission(user: User, permission: Permission): boolean {
    const userPermissions = this.getUserPermissions(user);
    return userPermissions.includes(permission);
  }

  public static hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  public static hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  public static getUserPermissions(user: User): Permission[] {
    const allPermissions = new Set<Permission>();

    user.roles.forEach(role => {
      const rolePermissions = this.ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => allPermissions.add(permission));
    });

    return Array.from(allPermissions);
  }

  public static canManageUser(actor: User, target: User): boolean {
    if (actor.hasRole(RoleType.SUPER_ADMIN)) {
      return true;
    }

    if (actor.hasRole(RoleType.ADMIN) && !target.hasRole(RoleType.SUPER_ADMIN)) {
      return true;
    }

    if (actor.id === target.id) {
      return true;
    }

    return false;
  }

  public static canAssignRole(actor: User, roleToAssign: RoleType): boolean {
    if (actor.hasRole(RoleType.SUPER_ADMIN)) {
      return true;
    }

    if (actor.hasRole(RoleType.ADMIN) && roleToAssign !== RoleType.SUPER_ADMIN) {
      return true;
    }

    return false;
  }
}