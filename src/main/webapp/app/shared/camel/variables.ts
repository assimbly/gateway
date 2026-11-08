/**
 * Variables in a Step's Path and Options. A Flow refers to a Variable as `@{key}`; the Gateway puts in its value when
 * it exports the Flow to the runtime (`Export.placeholdersReplacement`).
 */

/** How a Flow refers to the Variable with this key. */
export function variableRef(key: string): string {
  return `@{${key}}`;
}

/** The keys of the Variables a text refers to, each once, in the order they appear. */
export function referencedVariables(text: string | null | undefined): string[] {
  const keys = [...(text ?? '').matchAll(/@\{([^}]+)\}/g)].map(match => match[1].trim());
  return [...new Set(keys)];
}

/**
 * The text with each reference to a known Variable replaced by its value, as `Export.placeholdersReplacement` does,
 * for a page that sends to an endpoint itself rather than through an exported Flow. Unknown references stay.
 */
export function resolveVariables(text: string, values: Record<string, string>): string {
  return text.replace(/@\{([^}]+)\}/g, (ref, key: string) => values[key.trim()] ?? ref);
}

/** The keys the texts refer to that no Variable has, each once. */
export function unknownVariables(texts: (string | null | undefined)[], keys: Iterable<string>): string[] {
  const known = new Set(keys);
  return [...new Set(texts.flatMap(text => referencedVariables(text)))].filter(key => !known.has(key));
}

/** What the user is told about references to Variables that don't exist. */
export function unknownVariablesMessage(keys: string[]): string {
  return `${keys.length === 1 ? 'Unknown Variable' : 'Unknown Variables'}: ${keys.join(', ')}. Add ${keys.length === 1 ? 'it' : 'them'} under Flows → Variables.`;
}

/**
 * A warning for each Step whose path or Options refer to a Variable that doesn't exist. It doesn't make the Flow a
 * Draft: the Variable may be added before the Flow starts. Without the list of keys nothing is reported.
 */
export function variableWarnings(steps: { key: string; uri?: string; options?: string }[], keys: string[] | null): { stepKey: string; message: string }[] {
  if (!keys) {
    return [];
  }
  return steps
    .map(step => ({ stepKey: step.key, unknown: unknownVariables([step.uri, step.options], keys) }))
    .filter(({ unknown }) => unknown.length > 0)
    .map(({ stepKey, unknown }) => ({ stepKey, message: unknownVariablesMessage(unknown) }));
}

/**
 * What each Variable a text refers to stands for, one line each, to show when hovering the field; nothing when the
 * text refers to none. An encrypted value is never shown. Without the Variables, nothing is said about the references.
 */
export function describeVariables(
  text: string | null | undefined,
  variables: { key: string; value: string; encrypted: boolean }[] | null,
): string | undefined {
  const keys = referencedVariables(text);
  if (!keys.length || !variables) {
    return undefined;
  }
  const byKey = new Map(variables.map(variable => [variable.key, variable]));
  return keys
    .map(key => {
      const variable = byKey.get(key);
      if (!variable) {
        return `${variableRef(key)}: not defined`;
      }
      return variable.encrypted ? `${variableRef(key)}: encrypted` : `${variableRef(key)} = ${variable.value}`;
    })
    .join('\n');
}

/** A Flow's Variables by key from the rows they are edited in: a row without a key is left out, and the last row with a key wins. */
export function flowVariablesFrom(rows: { key?: string | null; value?: string | null }[]): Record<string, string> {
  const variables: Record<string, string> = {};
  rows.forEach(row => {
    const key = (row.key ?? '').trim();
    if (key) {
      variables[key] = row.value ?? '';
    }
  });
  return variables;
}

/** The keys more than one row has, each once, so the user can be told only the last one is kept. */
export function duplicateVariableKeys(rows: { key?: string | null }[]): string[] {
  const keys = rows.map(row => (row.key ?? '').trim()).filter(key => key);
  return [...new Set(keys.filter((key, i) => keys.indexOf(key) !== i))];
}

/**
 * The Variables a Flow's Steps can refer to: its own first, then the global ones it doesn't have, as the Gateway puts
 * them in when it exports the Flow. Null while the global Variables are unknown.
 */
export function flowAndGlobalVariables(
  flow: Record<string, string>,
  global: { key: string; value: string; encrypted: boolean }[] | null,
): { key: string; value: string; encrypted: boolean }[] | null {
  if (!global) {
    return null;
  }
  const own = Object.entries(flow).map(([key, value]) => ({ key, value, encrypted: false }));
  return [...own, ...global.filter(variable => !(variable.key in flow))];
}

/** The text with a reference to the Variable put in at the cursor, and where the cursor ends up after it. */
export function insertVariable(text: string, key: string, cursor = text.length): { text: string; cursor: number } {
  const at = Math.max(0, Math.min(cursor, text.length));
  const ref = variableRef(key);
  return { text: text.slice(0, at) + ref + text.slice(at), cursor: at + ref.length };
}
