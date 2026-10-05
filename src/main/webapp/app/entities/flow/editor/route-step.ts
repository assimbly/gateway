import { IRoute } from 'app/shared/model/route.model';

/** In a Route Flow each Step runs a Camel route in XML, and so does its Error handler. */
export function isRouteStep(stepType: string | null | undefined, activeEditor: string | null | undefined): boolean {
  return stepType === 'ROUTE' || (stepType === 'ERROR' && activeEditor === 'route');
}

/** The Route a Step edits: the name and content as typed. */
export interface RouteFields {
  name?: string | null;
  content?: string | null;
}

/** What a Route Step still needs before the Flow is saved. A Route needs both; an Error handler only once it has either. */
export function missingRouteFields(stepType: string | null | undefined, fields: RouteFields): { name: boolean; content: boolean } {
  const hasName = !!fields.name?.trim();
  const hasContent = !!fields.content?.trim();
  const required = stepType === 'ROUTE' || hasName || hasContent;
  return { name: required && !hasName, content: required && !hasContent };
}

/**
 * The Route to save for a Step: `saved` with the name and content as typed, or a new Route. Null when there is nothing
 * to save, because the Step leaves both empty or `saved` already has them.
 */
export function routeToSave(fields: RouteFields, saved: IRoute | undefined): IRoute | null {
  const name = fields.name?.trim() ?? '';
  const content = fields.content ?? '';
  if (!name && !content.trim()) {
    return null;
  }
  if (saved && saved.name === name && (saved.content ?? '') === content) {
    return null;
  }
  return { id: saved?.id, name, type: saved?.type ?? 'xml', content };
}
