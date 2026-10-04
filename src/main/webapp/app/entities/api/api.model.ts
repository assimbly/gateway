/** The HTTP methods an Operation can have. */
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
export type HttpMethod = (typeof METHODS)[number];

export const PARAMETER_TYPES = ['string', 'integer', 'number', 'boolean'] as const;

export const DEFAULT_MEDIA_TYPE = 'application/json';

export interface IApiParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  type?: string;
  required: boolean;
  description?: string;
}

/** One answer an Operation promises: a status from 100 to 599 or `default`, with a description. */
export interface IApiDeclaredResponse {
  status: string;
  description: string;
  mediaType?: string;
  schema?: string;
}

export interface IApiOperation {
  id?: number;
  apiId?: number;
  method: string;
  path: string;
  /** Base path + path; read-only. */
  fullPath?: string;
  operationId?: string;
  summary?: string;
  description?: string;
  requestMediaType?: string;
  responseMediaType?: string;
  requestSchema?: string;
  parameters: IApiParameter[];
  declaredResponses: IApiDeclaredResponse[];
  handlerFlowId?: number;
  handlerFlowName?: string;
  /** `flow` (Visual) or `script`; chosen when the Operation is created. */
  flowType?: string;
}

export interface IApi {
  id?: number;
  name: string;
  basePath: string;
  versionLabel?: string;
  description?: string;
  integrationId?: number;
  operationCount?: number;
  operations?: IApiOperation[];
}

/** What a Handler Flow knows of its API and Operation. */
export interface IApiHandler {
  apiId: number;
  apiName: string;
  operationId: number;
  method: string;
  fullPath: string;
  /** The path the runtime serves the Operation on, with the tenant prefix. */
  runtimePath: string;
  declaredStatuses: string[];
  responseMediaType?: string;
}

export interface IApiImportResult {
  api: IApi;
  dropped: string[];
}

export interface ITryRequest {
  pathParameters: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
}

export interface ITryResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  durationMillis: number;
  url: string;
}
