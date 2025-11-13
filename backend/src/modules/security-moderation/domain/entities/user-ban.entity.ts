import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ModerationAction } from '../enums/moderation-action.enum';

interface UserBanProps {
  userId: string;
  action: ModerationAction;
  reason: string;
  moderatorId: string;
  banUntil?: Date;
}

export class UserBan extends BaseEntity {
  private props: UserBanProps;

  private constructor(
    id: string,
    props: UserBanProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get userId(): string {
    return this.props.userId;
  }

  get action(): ModerationAction {
    return this.props.action;
  }

  get reason(): string {
    return this.props.reason;
  }

  get moderatorId(): string {
    return this.props.moderatorId;
  }

  get banUntil(): Date | undefined {
    return this.props.banUntil;
  }

  get isActive(): boolean {
    if (!this.props.banUntil) {
      return true;
    }
    return this.props.banUntil > new Date();
  }

  public static create(props: {
    userId: string;
    action: ModerationAction;
    reason: string;
    moderatorId: string;
    banUntil?: Date;
  }): UserBan {
    const id = this.generateId();
    return new UserBan(id, {
      userId: props.userId,
      action: props.action,
      reason: props.reason,
      moderatorId: props.moderatorId,
      banUntil: props.banUntil,
    });
  }

  public static restore(
    id: string,
    props: UserBanProps,
    createdAt: Date,
    updatedAt?: Date,
  ): UserBan {
    return new UserBan(id, props, createdAt, updatedAt);
  }

  private static generateId(): string {
    return `ban_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
