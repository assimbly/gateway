import { WritableSignal } from '@angular/core';

import { SendHeader, recordToHeaders } from './send-headers';

/** One message that is read from an uploaded file. */
export interface SendMessage {
  body: string;
  headers: SendHeader[];
}

export type BodyMode = 'json' | 'xml' | 'text';

/** The CodeMirror mode that fits the content. */
export function detectBodyMode(doc: string | null | undefined): BodyMode {
  if (!doc) {
    return 'text';
  }
  try {
    JSON.parse(doc);
    return 'json';
  } catch {
    // not JSON
  }
  const trimmed = doc.trim();
  if (!trimmed.startsWith('<')) {
    return 'text';
  }
  try {
    const xml = new DOMParser().parseFromString(trimmed, 'application/xml');
    return xml.getElementsByTagName('parsererror').length > 0 ? 'text' : 'xml';
  } catch {
    return 'text';
  }
}

/** The CodeMirror mode for a response, based on its first character. */
export function detectResponseMode(body: string | null | undefined): BodyMode {
  const text = (body ?? '').trimStart();
  if (text.startsWith('{') || text.startsWith('[')) {
    return 'json';
  }
  return text.startsWith('<') ? 'xml' : 'text';
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Reads the text of an uploaded file: either an Assimbly message file (`{"messages":{"message":[...]}}`) or any other
 * content, which becomes the body of one message. `jmsHeaders` of older message files are merged into the headers.
 */
export function parseUploadedText(text: string): SendMessage[] {
  try {
    const data = JSON.parse(text);
    const messages = asArray(data?.messages?.message);
    if (messages.length > 0) {
      return messages.map(message => ({
        body: message?.body ?? '',
        headers: recordToHeaders({ ...(message?.headers ?? {}), ...(message?.jmsHeaders ?? {}) }),
      }));
    }
  } catch {
    // not JSON: the content is the body
  }
  return [{ body: text, headers: [] }];
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * What an upload does to a Send page, the same on both pages: one message fills the body and the headers of the page,
 * several messages (a message file) are kept as a batch that is sent instead of the body,
 * for as long as the body still shows the text that announces the batch.
 */
export class UploadedMessages {
  private batch: SendMessage[] | null = null;
  private label = '';

  constructor(
    private readonly body: WritableSignal<string>,
    private readonly bodyMode: WritableSignal<BodyMode>,
    private readonly headers: WritableSignal<SendHeader[]>,
  ) {}

  async addFile(file: File): Promise<void> {
    this.apply(parseUploadedText(await readFileAsText(file)), file.name);
  }

  /** The messages to send: the batch of the last upload when its text is still in the body, otherwise the body. */
  messagesToSend(): SendMessage[] {
    if (this.batch && this.body() === this.label) {
      return this.batch;
    }
    return [{ body: this.body(), headers: [] }];
  }

  private apply(messages: SendMessage[], source: string): void {
    if (messages.length === 1) {
      const [message] = messages;
      this.batch = null;
      this.body.set(message.body);
      this.bodyMode.set(detectBodyMode(message.body));
      if (message.headers.length > 0) {
        this.headers.set(message.headers);
      }
      return;
    }

    this.batch = messages;
    this.label = `Uploaded ${messages.length} messages from ${source}`;
    this.body.set(this.label);
    this.bodyMode.set('text');
  }
}
