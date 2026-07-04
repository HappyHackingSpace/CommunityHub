// src/modules/iam/domain/events/role-assigned.event.ts
export class RoleAssignedEvent {
  constructor(
    public readonly userId: string,
    public readonly role: string,
    public readonly assignedBy: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}