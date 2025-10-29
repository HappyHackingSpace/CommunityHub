export class AssignRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly role: string,
    public readonly assignedBy: string, 
  ) {}
}