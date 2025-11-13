import { BaseEntity } from 'src/shared/domain/base-entity';
import { v4 as uuidv4 } from 'uuid';

enum AnnouncementScope {
  CLUB_ONLY = 'CLUB_ONLY',
  PUBLIC = 'PUBLIC',
}

interface ClubAnnouncementProps {
  clubId: string;
  authorId: string;
  title: string;
  content: string;
  scope: AnnouncementScope;
  isPinned: boolean;
}

export class ClubAnnouncement extends BaseEntity {
  private props: ClubAnnouncementProps;

  private constructor(
    id: string,
    props: ClubAnnouncementProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get clubId(): string {
    return this.props.clubId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get scope(): AnnouncementScope {
    return this.props.scope;
  }

  get isPinned(): boolean {
    return this.props.isPinned;
  }

  public static create(props: {
    clubId: string;
    authorId: string;
    title: string;
    content: string;
    scope: AnnouncementScope;
    isPinned?: boolean;
  }): ClubAnnouncement {
    const announcementId = uuidv4();
    return new ClubAnnouncement(announcementId, {
      clubId: props.clubId,
      authorId: props.authorId,
      title: props.title,
      content: props.content,
      scope: props.scope,
      isPinned: props.isPinned || false,
    });
  }

  public static restore(
    id: string,
    props: ClubAnnouncementProps,
    createdAt: Date,
    updatedAt?: Date,
  ): ClubAnnouncement {
    return new ClubAnnouncement(id, props, createdAt, updatedAt);
  }

  public update(props: {
    title?: string;
    content?: string;
    scope?: AnnouncementScope;
  }): void {
    if (props.title !== undefined) {
      this.props.title = props.title;
    }
    if (props.content !== undefined) {
      this.props.content = props.content;
    }
    if (props.scope !== undefined) {
      this.props.scope = props.scope;
    }
    this.updatedAt = new Date();
  }

  public pin(): void {
    this.props.isPinned = true;
    this.updatedAt = new Date();
  }

  public unpin(): void {
    this.props.isPinned = false;
    this.updatedAt = new Date();
  }
}

export { AnnouncementScope };
