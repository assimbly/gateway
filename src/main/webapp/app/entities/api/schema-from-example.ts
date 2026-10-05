/** A JSON Schema, as an Operation keeps it: opaque JSON. */
export type JsonSchema = Record<string, unknown>;

/**
 * A JSON Schema that describes an example body: each value's type, every key that is present as required, and an
 * array by its first element. It is a start to edit, not a full description.
 */
export function schemaFromExample(example: unknown): JsonSchema {
  if (example === null || example === undefined) {
    return { nullable: true };
  }
  if (Array.isArray(example)) {
    return { type: 'array', items: example.length ? schemaFromExample(example[0]) : {} };
  }
  switch (typeof example) {
    case 'number':
      return { type: Number.isInteger(example) ? 'integer' : 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'string':
      return { type: 'string' };
    case 'object': {
      const entries = Object.entries(example as Record<string, unknown>);
      return {
        type: 'object',
        required: entries.map(([key]) => key),
        properties: Object.fromEntries(entries.map(([key, value]) => [key, schemaFromExample(value)])),
      };
    }
    default:
      return {};
  }
}

/** The schema, as text, for an example typed as JSON text; or why the example can't be read. */
export function schemaFromExampleText(text: string): { schema: string } | { error: string } {
  try {
    return { schema: JSON.stringify(schemaFromExample(JSON.parse(text)), null, 2) };
  } catch (e) {
    return { error: `The example isn't valid JSON: ${(e as Error).message}` };
  }
}

/**
 * An example body for a schema, to start a Try it request from: the schema's own example when it has one, otherwise
 * a value of each type (an object with every property, an array of one item).
 */
export function exampleFromSchema(schema: unknown): unknown {
  if (!schema || typeof schema !== 'object') {
    return null;
  }
  const s = schema as Record<string, unknown>;
  if ('example' in s) {
    return s.example;
  }
  if (Array.isArray(s.examples) && s.examples.length) {
    return s.examples[0];
  }
  const type = Array.isArray(s.type) ? s.type.find(t => t !== 'null') : s.type;
  switch (type) {
    case 'object':
      return Object.fromEntries(Object.entries((s.properties as Record<string, unknown>) ?? {}).map(([key, value]) => [key, exampleFromSchema(value)]));
    case 'array':
      return [exampleFromSchema(s.items)];
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'string':
      return Array.isArray(s.enum) && s.enum.length ? s.enum[0] : 'string';
    default:
      return s.properties ? exampleFromSchema({ ...s, type: 'object' }) : null;
  }
}
