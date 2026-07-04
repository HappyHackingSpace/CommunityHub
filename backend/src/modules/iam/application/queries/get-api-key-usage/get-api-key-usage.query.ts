export class GetApiKeyUsageQuery {
  constructor(
    public readonly apiKeyId: string,
    public readonly from?: Date,
    public readonly to?: Date,
  ) {}
}
