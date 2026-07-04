// src/modules/iam/domain/events/user-registered.event.ts
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly googleId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly initialRoles: string[],
    public readonly occurredAt: Date = new Date(),
  ) {}
}