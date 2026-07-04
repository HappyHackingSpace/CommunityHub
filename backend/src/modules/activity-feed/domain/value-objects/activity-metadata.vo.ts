export interface ActivityMetadataProps {
  resourceId?: string;
  resourceType?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  additionalData?: Record<string, unknown>;
}

export class ActivityMetadata {
  private constructor(private props: ActivityMetadataProps) {}

  get resourceId(): string | undefined {
    return this.props.resourceId;
  }

  get resourceType(): string | undefined {
    return this.props.resourceType;
  }

  get title(): string | undefined {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get additionalData(): Record<string, unknown> | undefined {
    return this.props.additionalData;
  }

  public static create(props: ActivityMetadataProps): ActivityMetadata {
    return new ActivityMetadata(props);
  }

  public toObject(): ActivityMetadataProps {
    return { ...this.props };
  }
}
