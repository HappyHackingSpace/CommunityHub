import { SetMetadata } from '@nestjs/common';

export const RequireScopes = (...scopes: string[]) => SetMetadata('scopes', scopes);
