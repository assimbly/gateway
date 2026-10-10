import { computed, signal } from '@angular/core';

/** How long to wait for an answer of a send before telling the user that no answer came. */
export const SEND_TIMEOUT_MS = 30000;

export interface SendResult {
  status: 'sending' | 'success' | 'failed';
  /** Where the message goes, e.g. "queue TestQ" or "file://tmp". */
  target: string;
  total: number;
  succeeded: number;
  failed: number;
  /** When the last answer arrived. */
  time?: string;
  /** The error of the last failed message. */
  error?: string;
}

/** The text to show for a failed send. */
export function sendErrorText(error: any, timeoutMs: number = SEND_TIMEOUT_MS): string {
  if (error?.name === 'TimeoutError') {
    return `The endpoint did not answer within ${timeoutMs / 1000} seconds. The message may or may not have been sent, check the endpoint.`;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (typeof error?.error === 'string' && error.error.trim()) {
    return error.error;
  }
  return error?.error?.message ?? error?.message ?? 'Unknown error';
}

/** Keeps track of the messages of one send (a single message, or a batch from an upload) for the Send pages. */
export class SendState {
  readonly result = signal<SendResult | null>(null);
  readonly sending = computed(() => this.result()?.status === 'sending');

  start(total: number, target: string): void {
    this.result.set({ status: 'sending', target, total, succeeded: 0, failed: 0 });
  }

  succeed(): void {
    this.update(result => ({ ...result, succeeded: result.succeeded + 1 }));
  }

  fail(error: unknown): void {
    this.update(result => ({ ...result, failed: result.failed + 1, error: sendErrorText(error) }));
  }

  reset(): void {
    this.result.set(null);
  }

  private update(change: (result: SendResult) => SendResult): void {
    const current = this.result();
    if (!current) {
      return;
    }
    const next = change(current);
    const done = next.succeeded + next.failed >= next.total;
    this.result.set({
      ...next,
      time: new Date().toLocaleString(),
      status: done ? (next.failed > 0 ? 'failed' : 'success') : 'sending',
    });
  }
}
