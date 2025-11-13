import { BaseEntity } from '../../../../shared/domain/base-entity';
import { RoleType } from '../enums/role-type.enum';
import { Permission, PermissionSet } from '../value-objects/permission.vo';

interface RoleProps {
  roleType: RoleType;
  name: string;
  description: string;
  permissions: PermissionSet;
}

export class Role extends BaseEntity {
  private props: RoleProps;

  private constructor(
    id: string,
    props: RoleProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get roleType(): RoleType {
    return this.props.roleType;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get permissions(): PermissionSet {
    return this.props.permissions;
  }

  public static create(props: {
    roleType: RoleType;
    name: string;
    description: string;
    permissions?: Permission[];
  }): Role {
    const id = this.generateId();
    const permissions = PermissionSet.create(props.permissions || []);
    return new Role(id, {
      roleType: props.roleType,
      name: props.name,
      description: props.description,
      permissions,
    });
  }

  public static restore(
    id: string,
    props: RoleProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Role {
    return new Role(id, props, createdAt, updatedAt);
  }

  public addPermission(permission: Permission): void {
    this.props.permissions.add(permission);
    this.updatedAt = new Date();
  }

  public removePermission(permission: Permission): void {
    this.props.permissions.remove(permission);
    this.updatedAt = new Date();
  }

  public hasPermission(permission: Permission): boolean {
    return this.props.permissions.has(permission);
  }

  private static generateId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
