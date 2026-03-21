import { BaseEntity } from '../../../../shared/domain/base-entity';
import { DisplayName } from '../value-objects/display-name.vo';
import { GoogleId } from '../value-objects/google-id.vo';
import { RoleType } from '../enums/role-type.enum';
import { UserStatus } from '../enums/user-status.enum';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { RoleAssignedEvent } from '../events/role-assigned.event';


interface UserProps {
  googleId: GoogleId;
  email: string;
  displayName: DisplayName;
  avatarUrl?: string;
  roles: RoleType[];
  status: UserStatus;
  primaryTenantId?: string;
}

export class User extends BaseEntity {
  private props: UserProps;
  private domainEvents: any[] = []; 

  private constructor(id: string, props: UserProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get googleId(): GoogleId {
    return this.props.googleId;
  }

  get email(): string {
    return this.props.email;
  }

  get displayName(): DisplayName {
    return this.props.displayName;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get roles(): RoleType[] {
    return [...this.props.roles]; 
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get primaryTenantId(): string | undefined {
    return this.props.primaryTenantId;
  }

  get events(): any[] {
    return this.domainEvents;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  public static create(
    googleId: string,
    email: string,
    displayName: string,
    avatarUrl?: string,
  ): User {
    const id = this.generateId(); 

    const user = new User(
      id,
      {
        googleId: GoogleId.create(googleId),
        email: email.toLowerCase().trim(),
        displayName: DisplayName.create(displayName),
        avatarUrl,
        roles: [RoleType.GUEST], 
        status: UserStatus.ACTIVE,
      }
    );

    user.addDomainEvent(
      new UserRegisteredEvent(
        id,
        googleId,
        email,
        displayName,
        [RoleType.GUEST],
      )
    );

    return user;
  }

  public static restore(
    id: string,
    googleId: string,
    email: string,
    displayName: string,
    roles: RoleType[],
    status: UserStatus,
    avatarUrl?: string,
    createdAt?: Date,
    updatedAt?: Date,
    primaryTenantId?: string,
  ): User {
    return new User(
      id,
      {
        googleId: GoogleId.create(googleId),
        email,
        displayName: DisplayName.create(displayName),
        avatarUrl,
        roles,
        status,
        primaryTenantId,
      },
      createdAt,
      updatedAt,
    );
  }


  public assignRole(role: RoleType, assignedBy: string): void {
    if (this.hasRole(role)) {
      throw new Error(`User already has role: ${role}`);
    }

    this.props.roles.push(role);
    this.touch();

    this.addDomainEvent(
      new RoleAssignedEvent(this.id, role, assignedBy)
    );
  }

  public removeRole(role: RoleType, removedBy: string): void {
    if (!this.hasRole(role)) {
      throw new Error(`User does not have role: ${role}`);
    }

    if (role === RoleType.GUEST && this.props.roles.length === 1) {
      throw new Error('Cannot remove GUEST role when it is the only role');
    }

    this.props.roles = this.props.roles.filter(r => r !== role);
    this.touch();
  }

  public hasRole(role: RoleType): boolean {
    return this.props.roles.includes(role);
  }

  public hasAnyRole(roles: RoleType[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  public isAdmin(): boolean {
    return this.hasRole(RoleType.ADMIN) || this.hasRole(RoleType.SUPER_ADMIN);
  }

  public suspend(reason: string): void {
    if (this.props.status === UserStatus.SUSPENDED) {
      throw new Error('User is already suspended');
    }

    this.props.status = UserStatus.SUSPENDED;
    this.touch();
  }

  public activate(): void {
    if (this.props.status === UserStatus.ACTIVE) {
      throw new Error('User is already active');
    }

    this.props.status = UserStatus.ACTIVE;
    this.touch();
  }

  public updateProfile(displayName?: string, avatarUrl?: string): void {
    if (displayName) {
      this.props.displayName = DisplayName.create(displayName);
    }

    if (avatarUrl) {
      this.props.avatarUrl = avatarUrl;
    }

    this.touch();
  }

  public setPrimaryTenantId(tenantId: string): void {
    if (!this.props.primaryTenantId) {
      this.props.primaryTenantId = tenantId;
      this.touch();
    }
  }

  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  public clearEvents(): void {
    this.domainEvents = [];
  }
}