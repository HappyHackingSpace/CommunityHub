import { ReportStatus } from "src/modules/security-moderation/domain/enums/report-status.enum";

export class GetReportsQuery {
  constructor(
    public readonly status?: ReportStatus,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
