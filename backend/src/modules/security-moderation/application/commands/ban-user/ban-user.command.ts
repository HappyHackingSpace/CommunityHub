import { ModerationAction } from "src/modules/security-moderation/domain/enums/moderation-action.enum";

export class BanUserCommand {
  constructor(
    public readonly userId: string,
    public readonly action: ModerationAction,
    public readonly reason: string,
    public readonly moderatorId: string,
    public readonly banUntil?: Date,
  ) {}
}
