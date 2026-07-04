import { BaseEntity } from 'src/shared/domain/base-entity';
import { BadgeType } from '../enums/badge-type.enum';
import { v4 as uuidv4 } from 'uuid';

interface BadgeProps {
  userId: string;
  type: BadgeType;
  name: string;
  description: string;
  points: number;
  metadata?: Record<string, any>; // Additional data like task count, streak days, etc.
}

export class Badge extends BaseEntity {
  private props: BadgeProps;

  private constructor(
    id: string,
    props: BadgeProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get type(): BadgeType {
    return this.props.type;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get points(): number {
    return this.props.points;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  // Static factory method for creation
  public static create(props: {
    userId: string;
    type: BadgeType;
    name: string;
    description: string;
    points: number;
    metadata?: Record<string, any>;
  }): Badge {
    const badgeId = uuidv4();
    return new Badge(badgeId, {
      userId: props.userId,
      type: props.type,
      name: props.name,
      description: props.description,
      points: props.points,
      metadata: props.metadata,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: BadgeProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Badge {
    return new Badge(id, props, createdAt, updatedAt);
  }
}
