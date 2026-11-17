import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface ApiDefinition {
  /** Group of OpenApiGroupsConfiguration, served at /v3/api-docs/{id}. */
  id: string;
  label: string;
  icon: IconProp;
}

/** The definitions of the API Explorer, in the order of the Swagger UI dropdown. */
export const API_DEFINITIONS: readonly ApiDefinition[] = [
  { id: 'integration', label: 'Flows', icon: 'exchange-alt' },
  { id: 'broker', label: 'Broker', icon: 'envelope' },
  { id: 'configuration', label: 'Configuration', icon: 'cogs' },
  { id: 'resources', label: 'Resources', icon: 'database' },
  { id: 'observability', label: 'Observability', icon: 'heart' },
  { id: 'management', label: 'Management', icon: 'tachometer-alt' },
  { id: 'springdocDefault', label: 'All endpoints', icon: 'list' },
];

export const API_EXPLORER_PATH = '/explorer';
