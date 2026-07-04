import { BaseEntity } from 'src/shared/domain/base-entity';
import { RoleType } from '../enums/role-type.enum';

interface RoleProps {
  name: RoleType;
  description: string;
  permissions: string[]; 
}

export class Role extends BaseEntity {
  private props: RoleProps;

  private constructor(id: string, props: RoleProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get name(): RoleType {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get permissions(): string[] {
    return [...this.props.permissions];
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  public static create(
    name: RoleType,
    description: string,
    permissions: string[],
  ): Role {
    const id = this.generateId();

    return new Role(id, {
      name,
      description,
      permissions,
    });
  }

  public static restore(
    id: string,
    name: RoleType,
    description: string,
    permissions: string[],
    createdAt?: Date,
    updatedAt?: Date,
  ): Role {
    return new Role(id, { name, description, permissions }, createdAt, updatedAt);
  }

  public hasPermission(permission: string): boolean {
    return this.props.permissions.includes(permission);
  }

  public addPermission(permission: string): void {
    if (this.hasPermission(permission)) {
      throw new Error(`Permission already exists: ${permission}`);
    }

    this.props.permissions.push(permission);
    this.touch();
  }

  public removePermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission does not exist: ${permission}`);
    }

    this.props.permissions = this.props.permissions.filter(p => p !== permission);
    this.touch();
  }

  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}