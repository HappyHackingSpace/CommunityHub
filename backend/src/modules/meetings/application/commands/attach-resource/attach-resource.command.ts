import { ResourceType } from '../../../domain/enums/resource-type.enum';

export class AttachResourceCommand {
  constructor(
    public readonly meetingId: string,
    public readonly title: string,
    public readonly url: string,
    public readonly type: ResourceType,
    public readonly description: string | undefined,
    public readonly uploadedBy: string,
  ) {}
}
