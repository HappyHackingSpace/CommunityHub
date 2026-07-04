export class UpdateAgendaItemCommand {
  constructor(
    public readonly agendaItemId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly duration?: number,
    public readonly presenterId?: string,
  ) {}
}
