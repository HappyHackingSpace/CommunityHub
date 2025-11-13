import { ReportReason } from "src/modules/security-moderation/domain/enums/report-reason.enum";

export class CreateReportCommand {
  constructor(
    public readonly reporterId: string,
    public readonly targetUserId: string | undefined,
    public readonly targetContentId: string | undefined,
    public readonly reason: ReportReason,
    public readonly description: string,
  ) {}
}
