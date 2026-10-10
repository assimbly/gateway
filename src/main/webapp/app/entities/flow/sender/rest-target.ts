/**
 * An API Operation's Source is a `rest` Source that holds its method and path as Options (`method=get&path=/invoice`).
 * To send a message to it, the `rest` Component needs them in its path instead: `rest:method:path[:uriTemplate]`,
 * for example `get:invoice`, and the Options of the Source that only a consumer understands are dropped.
 */
export interface RestTarget {
  /** The path of the `rest` endpoint, such as `get:invoice`. */
  uri: string;
  /** The other Options of the Source, as `key=value&key=value`. */
  options: string;
}

/** Options that belong to the `rest` consumer (the Source) and have no meaning on the producer that sends the message. */
const CONSUMER_ONLY = new Set(['method', 'path', 'uritemplate', 'exchangepattern', 'routeid']);

/** Reads the method and path of a `rest` Source; undefined when the Source has no path of its own to read them from. */
export function restTargetOf(uri: string | null | undefined, options: string | null | undefined): RestTarget | undefined {
  if (uri?.trim()) {
    return undefined;
  }
  const pairs = (options ?? '')
    .split('&')
    .filter(option => option.includes('='))
    .map(option => {
      const [key, ...value] = option.split('=');
      return { key, value: value.join('=') };
    });
  const valueOf = (name: string) => pairs.find(pair => pair.key.toLowerCase() === name)?.value.trim();

  const method = valueOf('method')?.toLowerCase();
  const path = valueOf('path')?.replace(/^\/+/, '');
  if (!method || !path) {
    return undefined;
  }
  const uriTemplate = valueOf('uritemplate')?.replace(/^\/+/, '');

  return {
    uri: `${method}:${path}${uriTemplate ? `:${uriTemplate}` : ''}`,
    options: pairs
      .filter(pair => !CONSUMER_ONLY.has(pair.key.toLowerCase()))
      .map(pair => `${pair.key}=${pair.value}`)
      .join('&'),
  };
}

/**
 * The `host` Option of the `rest` Component, which tells it where the runtime's REST listener is, such as
 * `http://localhost:8081`. Without it the Component has no server to send the message to.
 */
export function restHostOf(listenerUrl: string | null | undefined): string | undefined {
  const host = (listenerUrl ?? '').trim().replace(/\/+$/, '');
  return host || undefined;
}
