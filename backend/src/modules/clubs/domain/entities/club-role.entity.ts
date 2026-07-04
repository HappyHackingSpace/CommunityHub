import { BaseEntity } from 'src/shared/domain/base-entity';
import { ClubRoleType } from '../enums/club-role-type.enum';
import { v4 as uuidv4 } from 'uuid';

interface ClubRoleProps {
  clubId: string;
  name: string;
  roleType: ClubRoleType;
  permissions: string[];
  isCustom: boolean;
}

export class ClubRole extends BaseEntity {
  private props: ClubRoleProps;

  private constructor(
    id: string,
    props: ClubRoleProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get clubId(): string {
    return this.props.clubId;
  }

  get name(): string {
    return this.props.name;
  }

  get roleType(): ClubRoleType {
    return this.props.roleType;
  }

  get permissions(): string[] {
    return [...this.props.permissions];
  }

  get isCustom(): boolean {
    return this.props.isCustom;
  }

  public static create(props: {
    clubId: string;
    name: string;
    roleType: ClubRoleType;
    permissions?: string[];
    isCustom?: boolean;
  }): ClubRole {
    const roleId = uuidv4();
    return new ClubRole(roleId, {
      clubId: props.clubId,
      name: props.name,
      roleType: props.roleType,
      permissions: props.permissions || [],
      isCustom: props.isCustom || false,
    });
  }

  public static restore(
    id: string,
    props: ClubRoleProps,
    createdAt: Date,
    updatedAt?: Date,
  ): ClubRole {
    return new ClubRole(id, props, createdAt, updatedAt);
  }

  public addPermission(permission: string): void {
    if (!this.props.permissions.includes(permission)) {
      this.props.permissions.push(permission);
      this.updatedAt = new Date();
    }
  }

  public removePermission(permission: string): void {
    const index = this.props.permissions.indexOf(permission);
    if (index > -1) {
      this.props.permissions.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public hasPermission(permission: string): boolean {
    return this.props.permissions.includes(permission);
  }
}
