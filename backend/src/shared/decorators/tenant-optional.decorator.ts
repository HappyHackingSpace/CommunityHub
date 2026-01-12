import { SetMetadata } from '@nestjs/common';

export const IS_TENANT_OPTIONAL_KEY = 'isTenantOptional';


export const TenantOptional = () => SetMetadata(IS_TENANT_OPTIONAL_KEY, true);
