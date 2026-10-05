/**
 * Editing an Endpoint (`component:path?options`) the same way for every Component (ADR 0002): everything here is
 * read from the component schema the backend serves (`/flow/schema/{component}`).
 */
import { EndpointRole } from './catalogue';

/** One property of a component schema: a path part (`kind: path`) or an Option (`kind: parameter`). */
export interface OptionSchema {
  name: string;
  kind?: string;
  displayName?: string;
  description?: string;
  group?: string;
  /** Comma-separated tags, such as `consumer,scheduler`. */
  label?: string;
  type?: string;
  enum?: readonly string[];
  defaultValue?: unknown;
  required?: boolean;
  secret?: boolean;
}

export type OptionHeading = 'Common' | 'Advanced' | 'Security';
const HEADINGS: OptionHeading[] = ['Common', 'Advanced', 'Security'];

export type ValueField = 'switch' | 'choice' | 'number' | 'secret' | 'text';

function tagsOf(option: OptionSchema): string[] {
  return [option.group ?? '', ...(option.label ?? '').split(',')].map(tag =>
    tag
      .replace(/\(advanced\)/, '')
      .trim()
      .toLowerCase(),
  );
}

/** Whether an Option applies to a Step of this role: consumer Options only to a Source, producer Options only to Actions and Sinks. */
export function fitsRole(option: OptionSchema, role: EndpointRole): boolean {
  const tags = tagsOf(option);
  return role === 'consumer' ? !tags.includes('producer') : !tags.includes('consumer');
}

/**
 * The heading an Option is listed under. `common` and the role's own group (`consumer` or `producer`) are Common,
 * groups about security are Security, and every other group is Advanced.
 */
export function optionHeading(option: OptionSchema): OptionHeading {
  const group = (option.group ?? '').toLowerCase();
  if (group.includes('security')) {
    return 'Security';
  }
  return group === 'common' || group === 'consumer' || group === 'producer' ? 'Common' : 'Advanced';
}

/** The Options a Step of this role can set, each with its heading, in heading order and then by display name. */
export function groupOptions<T extends OptionSchema>(properties: T[], role: EndpointRole): (T & { heading: OptionHeading })[] {
  return properties
    .filter(option => option.kind !== 'path' && fitsRole(option, role))
    .map(option => ({ ...option, heading: optionHeading(option) }))
    .sort(
      (a, b) =>
        HEADINGS.indexOf(a.heading) - HEADINGS.indexOf(b.heading) || (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name),
    );
}

/** The field an Option's value is entered in, from its type. An Option the schema doesn't know gets a text field. */
export function valueFieldOf(option: Pick<OptionSchema, 'type' | 'enum' | 'secret'> | undefined): ValueField {
  if (option?.secret) {
    return 'secret';
  }
  switch (option?.type) {
    case 'boolean':
      return 'switch';
    case 'enum':
      return 'choice';
    case 'integer':
    case 'number':
      return 'number';
    default:
      return option?.enum?.length ? 'choice' : 'text';
  }
}

/** The required Options a Step of this role needs; they are pre-added and warned about, but don't make a Draft. */
export function requiredOptions(properties: OptionSchema[], role: EndpointRole): string[] {
  return properties.filter(option => option.kind !== 'path' && option.required && fitsRole(option, role)).map(option => option.name);
}

export interface PathPart {
  name: string;
  displayName: string;
  description?: string;
  required: boolean;
}

/** A Component's path syntax, such as `sftp:host:port/directoryName`, read into its parts. */
export interface PathRule {
  syntax: string;
  parts: PathPart[];
  /** The characters that separate the parts, such as `:` and `/`. */
  delimiters: string;
}

export function pathRule(syntax: string, properties: OptionSchema[]): PathRule {
  const rest = syntax.slice(syntax.indexOf(':') + 1);
  const byName = new Map(properties.filter(p => p.kind === 'path').map(p => [p.name, p]));
  const parts = (rest.match(/[A-Za-z0-9_]+/g) ?? []).map(name => {
    const property = byName.get(name);
    return { name, displayName: property?.displayName ?? name, description: property?.description, required: !!property?.required };
  });
  const delimiters = [...new Set(rest.replace(/[A-Za-z0-9_]+/g, ''))].join('');
  return { syntax, parts, delimiters };
}

/**
 * The display names of required path parts the path leaves empty. Optional parts may be left out, so the values
 * are matched to the required parts by count, as Camel does when it reads a shorter path.
 */
export function missingPathParts(rule: PathRule, path: string | null | undefined): string[] {
  const required = rule.parts.filter(part => part.required);
  const values = rule.delimiters ? (path ?? '').split(new RegExp(`[${rule.delimiters.replace(/[\\\]^-]/g, '\\$&')}]`)) : [path ?? ''];
  const filled = values.filter(value => value.trim().length > 0).length;
  return required.slice(filled).map(part => part.displayName);
}
