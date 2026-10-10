import { IHeader } from 'app/shared/model/header.model';

/**
 * One row of the headers editor on the Send pages. `type` and `language` are only shown for Flow templates,
 * `id` is the id of the stored header of a Message template the row was loaded from.
 */
export interface SendHeader {
  id?: number;
  key: string;
  value: string;
  type?: string;
  language?: string;
}

export const HEADER_TYPES = ['header', 'property'];
export const HEADER_LANGUAGES = ['constant', 'simple', 'groovy', 'jsonpath', 'xpath'];

export function emptyHeader(): SendHeader {
  return { key: '', value: '', type: HEADER_TYPES[0], language: HEADER_LANGUAGES[0] };
}

/** Converts a plain object (key -> value) to editor rows. */
export function recordToHeaders(record: Record<string, unknown> | null | undefined): SendHeader[] {
  if (!record || typeof record !== 'object') {
    return [];
  }
  return Object.entries(record).map(([key, value]) => ({
    key,
    value: value === null || value === undefined ? '' : String(value),
    type: HEADER_TYPES[0],
    language: HEADER_LANGUAGES[0],
  }));
}

/** Converts the headers of a stored Message template to editor rows. */
export function templateHeadersToRows(headers: IHeader[] | null | undefined): SendHeader[] {
  return (headers ?? []).map(header => ({
    id: header.id,
    key: header.key ?? '',
    value: header.value ?? '',
    type: header.type ?? HEADER_TYPES[0],
    language: header.language ?? HEADER_LANGUAGES[0],
  }));
}

/** Rows that carry a key. Rows without a key are ignored when sending. */
export function filledHeaders(rows: SendHeader[]): SendHeader[] {
  return rows.filter(row => !!row.key?.trim());
}

/** Plain JSON (key -> value), the format of the broker send endpoint. */
export function headersToJson(rows: SendHeader[]): Record<string, string> {
  const json: Record<string, string> = {};
  for (const row of filledHeaders(rows)) {
    json[row.key.trim()] = row.value ?? '';
  }
  return json;
}

/**
 * JSON (key -> `type(value)`), the format of the flow send endpoint. It is the same shape that
 * `GET /api/messages/{id}/headers` returns for a stored Message template, so a header sent from the rows behaves
 * exactly like the same header sent from a template.
 */
export function headersToTemplateJson(rows: SendHeader[]): Record<string, string> {
  const json: Record<string, string> = {};
  for (const row of filledHeaders(rows)) {
    json[row.key.trim()] = `${row.type || HEADER_TYPES[0]}(${row.value ?? ''})`;
  }
  return json;
}

/** True when both lists contain the same filled in headers in the same order. */
export function sameHeaders(a: SendHeader[], b: SendHeader[]): boolean {
  const left = filledHeaders(a);
  const right = filledHeaders(b);
  return (
    left.length === right.length &&
    left.every((row, i) => {
      const other = right[i];
      return (
        row.key.trim() === other.key.trim() &&
        (row.value ?? '') === (other.value ?? '') &&
        (row.type || HEADER_TYPES[0]) === (other.type || HEADER_TYPES[0]) &&
        (row.language || HEADER_LANGUAGES[0]) === (other.language || HEADER_LANGUAGES[0])
      );
    })
  );
}
