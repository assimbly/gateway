import dayjs from 'dayjs/esm';

import { FlowFailure } from './flow-status';

/** What the Gateway did with a Flow when it failed, as the Flows list and the editor ask the runtime. */
export type FlowVerb = 'start' | 'restart' | 'stop' | 'pause' | 'resume' | 'configure';

/**
 * One Alert of a Flow. The runtime writes one for every message that failed; the Gateway adds one when the Flow itself
 * failed, such as a Step that didn't start, as `Failed to start [file://in]: Multiple consumers …`.
 */
export interface FlowAlert {
  /** When the alert was written, or undefined when the line has no timestamp. */
  at?: dayjs.Dayjs;
  /** `flow` when the Flow failed to start, stop and so on; `message` when a message failed. */
  kind: 'flow' | 'message';
  /** What failed: `Failed to start`, or `Failed message`. */
  title: string;
  /** The Endpoint of the Step that failed, when known. */
  endpoint?: string;
  /** The error itself, as the runtime said it. */
  message: string;
}

const FLOW_ERROR = /^(Failed to (?:start|restart|stop|pause|resume|configure))(?: \[([^\]]+)\])?: (.*)$/s;

/** Reads an alert line, `2026-03-06 09:53:13 +0100 : Cannot store file`, into its time, kind and message. */
export function parseAlert(line: string): FlowAlert {
  let at: dayjs.Dayjs | undefined;
  let text = line;
  const separator = line.indexOf(' : ');
  if (separator > 0) {
    const time = dayjs(line.slice(0, separator), 'YYYY-MM-DD HH:mm:ss ZZ');
    if (time.isValid()) {
      at = time;
      text = line.slice(separator + 3);
    }
  }
  const flowError = text.match(FLOW_ERROR);
  if (flowError) {
    return { ...(at ? { at } : {}), kind: 'flow', title: flowError[1], ...(flowError[2] ? { endpoint: flowError[2] } : {}), message: flowError[3] };
  }
  return { ...(at ? { at } : {}), kind: 'message', title: 'Failed message', message: text };
}

/** The alert lines of a Flow that failed: one per failed Step, or one for the Flow when no Step is named. */
export function failureLines(verb: FlowVerb, failure: FlowFailure): string[] {
  const title = `Failed to ${verb}`;
  if (failure.steps.length) {
    return failure.steps.map(step => `${title}${step.uri ? ` [${step.uri}]` : ''}: ${step.message}`);
  }
  return [`${title}: ${failure.summary}`];
}
