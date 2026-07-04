import { BaseEntity } from '../../../../shared/domain/base-entity';

interface ApiKeyUsageLogProps {
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  responseTimeMs?: number;
}

export class ApiKeyUsageLog extends BaseEntity {
  private props: ApiKeyUsageLogProps;

  private constructor(
    id: string,
    props: ApiKeyUsageLogProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  get apiKeyId(): string {
    return this.props.apiKeyId;
  }

  get endpoint(): string {
    return this.props.endpoint;
  }

  get method(): string {
    return this.props.method;
  }

  get statusCode(): number {
    return this.props.statusCode;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get responseTimeMs(): number | undefined {
    return this.props.responseTimeMs;
  }

  public static create(props: {
    apiKeyId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    ipAddress?: string;
    userAgent?: string;
    responseTimeMs?: number;
  }): ApiKeyUsageLog {
    const id = this.generateId();

    return new ApiKeyUsageLog(
      id,
      {
        apiKeyId: props.apiKeyId,
        endpoint: props.endpoint,
        method: props.method,
        statusCode: props.statusCode,
        ipAddress: props.ipAddress,
        userAgent: props.userAgent,
        responseTimeMs: props.responseTimeMs,
      },
    );
  }

  public static restore(
    id: string,
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    ipAddress?: string,
    userAgent?: string,
    responseTimeMs?: number,
    createdAt?: Date,
    updatedAt?: Date,
  ): ApiKeyUsageLog {
    return new ApiKeyUsageLog(
      id,
      {
        apiKeyId,
        endpoint,
        method,
        statusCode,
        ipAddress,
        userAgent,
        responseTimeMs,
      },
      createdAt,
      updatedAt,
    );
  }

  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
