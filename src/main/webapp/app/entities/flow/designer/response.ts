/**
 * What a Response Sink answers. A Response is a setmessage Sink: the body (an expression in its language) is kept in
 * the Step's uri, and the status, the language and the headers in its options, such as
 * `status=201&language=simple&header.X-Trace=abc` with each header value URL-encoded. No body keeps the current one.
 * The backend reads the same format (ResponseSettings.java).
 */
export interface ResponseSettings {
  status: string;
  body?: string;
  language?: string;
  headers: { name: string; value: string }[];
}

export const DEFAULT_STATUS = '200';
const HEADER_PREFIX = 'header.';

export function responseSettings(step: { uri?: string | null; options?: string | null }): ResponseSettings {
  const settings: ResponseSettings = { status: DEFAULT_STATUS, body: step.uri || undefined, language: undefined, headers: [] };
  for (const option of (step.options ?? '').split('&').filter(Boolean)) {
    const separator = option.indexOf('=');
    const key = separator < 0 ? option : option.substring(0, separator);
    const value = separator < 0 ? '' : option.substring(separator + 1);
    if (key === 'status' && value) {
      settings.status = value;
    } else if (key === 'language' && value) {
      settings.language = value;
    } else if (key.startsWith(HEADER_PREFIX) && key.length > HEADER_PREFIX.length) {
      settings.headers.push({ name: key.substring(HEADER_PREFIX.length), value: decode(value) });
    }
  }
  if (!settings.body) {
    settings.language = undefined;
  }
  return settings;
}

/** The Step's uri and options for these settings; headers without a name are left out. */
export function responseOptions(settings: ResponseSettings): { uri: string | undefined; options: string } {
  const body = settings.body || undefined;
  const options = [`status=${settings.status || DEFAULT_STATUS}`];
  if (body && settings.language) {
    options.push(`language=${settings.language}`);
  }
  settings.headers
    .filter(header => header.name.trim())
    .forEach(header => options.push(`${HEADER_PREFIX}${header.name.trim()}=${encodeURIComponent(header.value)}`));
  return { uri: body, options: options.join('&') };
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
