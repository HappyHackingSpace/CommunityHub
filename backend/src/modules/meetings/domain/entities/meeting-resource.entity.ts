import { BaseEntity } from '../../../../shared/domain/base-entity';
import { ResourceType } from '../enums/resource-type.enum';

interface MeetingResourceProps {
  meetingId: string;
  title: string;
  url: string;
  type: ResourceType;
  description?: string;
  uploadedBy: string; // User ID
}

export class MeetingResource extends BaseEntity {
  private props: MeetingResourceProps;

  private constructor(
    id: string,
    props: MeetingResourceProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get meetingId(): string {
    return this.props.meetingId;
  }

  get title(): string {
    return this.props.title;
  }

  get url(): string {
    return this.props.url;
  }

  get type(): ResourceType {
    return this.props.type;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get uploadedBy(): string {
    return this.props.uploadedBy;
  }

  public static create(props: {
    meetingId: string;
    title: string;
    url: string;
    type: ResourceType;
    description?: string;
    uploadedBy: string;
  }): MeetingResource {
    this.validate(props);

    const resourceId = this.generateId();
    return new MeetingResource(resourceId, {
      meetingId: props.meetingId,
      title: props.title,
      url: props.url,
      type: props.type,
      description: props.description,
      uploadedBy: props.uploadedBy,
    });
  }

  public static restore(
    id: string,
    props: MeetingResourceProps,
    createdAt: Date,
    updatedAt?: Date
  ): MeetingResource {
    return new MeetingResource(id, props, createdAt, updatedAt);
  }

  public update(props: {
    title?: string;
    url?: string;
    type?: ResourceType;
    description?: string;
  }): void {
    if (props.title !== undefined) {
      if (!props.title || props.title.trim().length === 0) {
        throw new Error('Resource title cannot be empty');
      }
      this.props.title = props.title;
    }

    if (props.url !== undefined) {
      if (!MeetingResource.isValidUrl(props.url)) {
        throw new Error('Invalid resource URL');
      }
      this.props.url = props.url;
    }

    if (props.type !== undefined) {
      this.props.type = props.type;
    }

    if (props.description !== undefined) {
      this.props.description = props.description;
    }

    this.updatedAt = new Date();
  }

  private static validate(props: {
    title: string;
    url: string;
  }): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Resource title cannot be empty');
    }

    if (props.title.length > 200) {
      throw new Error('Resource title cannot exceed 200 characters');
    }

    if (!this.isValidUrl(props.url)) {
      throw new Error('Invalid resource URL');
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static generateId(): string {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
