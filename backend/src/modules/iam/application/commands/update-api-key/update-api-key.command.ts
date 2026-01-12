import { UpdateApiKeyDto } from '../../dto/update-api-key.dto';

export class UpdateApiKeyCommand {
  constructor(
    public readonly apiKeyId: string,
    public readonly dto: UpdateApiKeyDto,
  ) {}
}
