import { BaseEntity } from 'src/shared/domain/base-entity';
import { ClubName } from '../value-objects/club-name.vo';
import { ClubDescription } from '../value-objects/club-description.vo';
import { ClubManifesto } from '../value-objects/club-manifesto.vo';
import { ClubVisibility } from '../enums/club-visibility.enum';
import { v4 as uuidv4 } from 'uuid';

interface ClubProps {
  name: ClubName;
  description: ClubDescription;
  logoUrl?: string;
  visibility: ClubVisibility;
  leaders: string[];
  manifesto?: ClubManifesto;
  slackUrl?: string;
  discordUrl?: string;
  darkThemeEnabled: boolean;
  totalTasksCompleted: number;
  totalMeetingsHeld: number;
}

export class Club extends BaseEntity {
  private props: ClubProps;

  private constructor(
    id: string,
    props: ClubProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get name(): ClubName {
    return this.props.name;
  }

  get description(): ClubDescription {
    return this.props.description;
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }

  get visibility(): ClubVisibility {
    return this.props.visibility;
  }

  get leaders(): string[] {
    return [...this.props.leaders];
  }

  get manifesto(): ClubManifesto | undefined {
    return this.props.manifesto;
  }

  get slackUrl(): string | undefined {
    return this.props.slackUrl;
  }

  get discordUrl(): string | undefined {
    return this.props.discordUrl;
  }

  get darkThemeEnabled(): boolean {
    return this.props.darkThemeEnabled;
  }

  get totalTasksCompleted(): number {
    return this.props.totalTasksCompleted;
  }

  get totalMeetingsHeld(): number {
    return this.props.totalMeetingsHeld;
  }

  public static create(props: {
    name: string;
    description: string;
    logoUrl?: string;
    visibility?: ClubVisibility;
    leaderId: string;
    manifesto?: string;
    slackUrl?: string;
    discordUrl?: string;
    darkThemeEnabled?: boolean;
  }): Club {
    const clubId = uuidv4();
    return new Club(clubId, {
      name: ClubName.create(props.name),
      description: ClubDescription.create(props.description),
      logoUrl: props.logoUrl,
      visibility: props.visibility || ClubVisibility.PUBLIC,
      leaders: [props.leaderId],
      manifesto: props.manifesto ? ClubManifesto.create(props.manifesto) : undefined,
      slackUrl: props.slackUrl,
      discordUrl: props.discordUrl,
      darkThemeEnabled: props.darkThemeEnabled || false,
      totalTasksCompleted: 0,
      totalMeetingsHeld: 0,
    });
  }

  public static restore(
    id: string,
    props: ClubProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Club {
    return new Club(id, props, createdAt, updatedAt);
  }

  public update(props: {
    name?: string;
    description?: string;
    logoUrl?: string;
    visibility?: ClubVisibility;
    manifesto?: string;
    slackUrl?: string;
    discordUrl?: string;
    darkThemeEnabled?: boolean;
  }): void {
    if (props.name !== undefined) {
      this.props.name = ClubName.create(props.name);
    }
    if (props.description !== undefined) {
      this.props.description = ClubDescription.create(props.description);
    }
    if (props.logoUrl !== undefined) {
      this.props.logoUrl = props.logoUrl;
    }
    if (props.visibility !== undefined) {
      this.props.visibility = props.visibility;
    }
    if (props.manifesto !== undefined) {
      this.props.manifesto = props.manifesto
        ? ClubManifesto.create(props.manifesto)
        : undefined;
    }
    if (props.slackUrl !== undefined) {
      this.props.slackUrl = props.slackUrl;
    }
    if (props.discordUrl !== undefined) {
      this.props.discordUrl = props.discordUrl;
    }
    if (props.darkThemeEnabled !== undefined) {
      this.props.darkThemeEnabled = props.darkThemeEnabled;
    }
    this.updatedAt = new Date();
  }

  public addLeader(userId: string): void {
    if (!this.props.leaders.includes(userId)) {
      this.props.leaders.push(userId);
      this.updatedAt = new Date();
    }
  }

  public removeLeader(userId: string): void {
    if (this.props.leaders.length === 1) {
      throw new Error('A club must have at least one leader');
    }
    const index = this.props.leaders.indexOf(userId);
    if (index > -1) {
      this.props.leaders.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public isLeader(userId: string): boolean {
    return this.props.leaders.includes(userId);
  }

  public isPublic(): boolean {
    return this.props.visibility === ClubVisibility.PUBLIC;
  }

  public isPrivate(): boolean {
    return this.props.visibility === ClubVisibility.PRIVATE;
  }

  public incrementTasksCompleted(): void {
    this.props.totalTasksCompleted += 1;
    this.updatedAt = new Date();
  }

  public incrementMeetingsHeld(): void {
    this.props.totalMeetingsHeld += 1;
    this.updatedAt = new Date();
  }

  public canBeModifiedBy(userId: string): boolean {
    return this.isLeader(userId);
  }

  public canBeDeletedBy(userId: string): boolean {
    return this.isLeader(userId);
  }
}
