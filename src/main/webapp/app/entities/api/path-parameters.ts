import { IApiParameter } from './api.model';

const PARAMETER = /\{([^}/]*)}/g;

export function pathParameterNames(template: string | null | undefined): string[] {
  return [...(template ?? '').matchAll(PARAMETER)].map(match => match[1]).filter(name => name.length > 0);
}

/**
 * The parameters with the path parameters derived from the template, as the Gateway saves them: one per `{name}`,
 * required, keeping the type and description given; query and header parameters stay as they are.
 */
export function withPathParameters(template: string | null | undefined, parameters: IApiParameter[]): IApiParameter[] {
  const derived = [...new Set(pathParameterNames(template))].map(
    (name): IApiParameter => {
      const given = parameters.find(p => p.in === 'path' && p.name === name);
      return { name, in: 'path', type: given?.type ?? 'string', required: true, description: given?.description };
    },
  );
  return [...derived, ...parameters.filter(p => p.in !== 'path')];
}
