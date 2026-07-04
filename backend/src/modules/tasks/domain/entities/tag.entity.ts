import { BaseEntity } from 'src/shared/domain/base-entity';
import { TagName } from '../value-objects/tag-name.vo';
import { v4 as uuidv4 } from 'uuid';

interface TagProps {
  name: TagName;
  color?: string;
}

export class Tag extends BaseEntity {
  private props: TagProps;

  private constructor(
    id: string,
    props: TagProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get name(): TagName {
    return this.props.name;
  }

  get color(): string | undefined {
    return this.props.color;
  }

  // Static factory method for creation
  public static create(props: { name: string; color?: string }): Tag {
    const tagId = uuidv4();
    return new Tag(tagId, {
      name: TagName.create(props.name),
      color: props.color,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: TagProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Tag {
    return new Tag(id, props, createdAt, updatedAt);
  }
}
