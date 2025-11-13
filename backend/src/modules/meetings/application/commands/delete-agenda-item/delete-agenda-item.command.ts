export class DeleteAgendaItemCommand {
  constructor(
    public readonly agendaItemId: string,
    public readonly userId: string,
  ) {}
}
