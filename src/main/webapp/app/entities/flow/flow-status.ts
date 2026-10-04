import { IStep, StepType } from 'app/shared/model/step.model';
import { StatusControlsTone } from 'app/shared/table';

/** The runtime state the Flows list tracks for a row. */
export type RuntimeStatus = 'active' | 'paused' | 'inactive' | 'inactiveError';

/** Reads a status or event word the runtime reports, such as `started` or `suspend`. */
export function runtimeStatusOf(reported: string | null | undefined): RuntimeStatus {
  switch (reported) {
    case 'started':
    case 'start':
    case 'resumed':
    case 'resume':
    case 'restarted':
    case 'restart':
      return 'active';
    case 'suspended':
    case 'suspend':
    case 'paused':
    case 'pause':
      return 'paused';
    case 'error':
    case 'failed':
      return 'inactiveError';
    default:
      return 'inactive';
  }
}

export type FlowAction = 'start' | 'stop' | 'resume' | 'pause' | 'restart';

export interface FlowStatusView {
  /** The Flow status in words, for the controls' tooltip and screen readers. */
  label: 'Running' | 'Paused' | 'Stopped' | 'Error';
  /** The colour of the controls, which shows the Flow status. */
  tone: StatusControlsTone;
  /** A Draft can't be started until its design is finished. */
  draft: boolean;
  /** The play/pause/stop buttons shown for the state, like a media player's. */
  controls: FlowAction[];
  /** The shown buttons that can't be used in this state. */
  disabled: FlowAction[];
}

const BY_STATUS: Record<RuntimeStatus, Omit<FlowStatusView, 'draft'>> = {
  active: { label: 'Running', tone: 'started', controls: ['pause', 'stop', 'restart'], disabled: [] },
  paused: { label: 'Paused', tone: 'paused', controls: ['resume', 'stop', 'restart'], disabled: [] },
  inactive: { label: 'Stopped', tone: 'default', controls: ['start', 'pause', 'stop'], disabled: ['pause', 'stop'] },
  inactiveError: { label: 'Error', tone: 'failed', controls: ['start', 'pause', 'stop'], disabled: ['pause', 'stop'] },
};

/** What a Flows list row shows for a Flow's runtime state. A Draft that is still running can still be stopped. */
export function flowStatusView(status: RuntimeStatus, draft: boolean): FlowStatusView {
  const view = BY_STATUS[status];
  return { ...view, draft, disabled: draft && view.controls.includes('start') ? ['start', ...view.disabled] : view.disabled };
}

/**
 * Whether the Flow has run since the Gateway started, from the status the runtime reports. The runtime answers
 * `unconfigured` until a Flow is first started; its statistics are zero either way, so they can't tell.
 */
export function hasRun(runtimeStatus: string | null | undefined): boolean {
  return !!runtimeStatus && runtimeStatus !== 'unconfigured';
}

/** A Completed or Failed count: `—` when the Flow never ran, otherwise the count, `0` included. */
export function countLabel(count: number | null | undefined, ran: boolean): string {
  return ran ? String(count ?? 0) : '—';
}

/** The Flow type as the UI names it. */
export function flowTypeLabel(type: string | undefined): 'Visual' | 'Script' | 'Route' {
  switch (type) {
    case 'script':
      return 'Script';
    case 'route':
      return 'Route';
    default:
      return 'Visual';
  }
}

/** A Flow's Source Step; older Flows call it FROM. A Route Flow has none. */
export function sourceStepOf(steps: IStep[] | null | undefined): IStep | undefined {
  return steps?.find(step => step.stepType === StepType.SOURCE || step.stepType === StepType.FROM);
}

/**
 * Why a test message can't be sent to the Flow's Source now, or null when it can. A test message is sent to the
 * Source's Endpoint, so the Flow has to be running, have a Source, and the Source's Component has to accept messages
 * sent to it. `source` is null for a Flow without a Source.
 */
export function testMessageBlocked(
  status: RuntimeStatus,
  source: { name: string; title?: string; consumerOnly?: boolean } | null,
): string | null {
  if (status !== 'active') {
    return 'Start the Flow to send it a test message.';
  }
  if (!source) {
    return 'This Flow has no Source to send a test message to.';
  }
  if (source.consumerOnly) {
    return `A test message can't be sent to a ${source.title ?? source.name} Source.`;
  }
  return null;
}

/** Why a Flow didn't start: a one-line summary and, per failed Step, its Endpoint and the runtime's message. */
export interface FlowFailure {
  summary: string;
  steps: Array<{ uri?: string; message: string }>;
}

const DEFAULT_FAILURE = 'The Flow could not be started.';

/**
 * Reads a failure from what the runtime answered to start, stop, pause or resume: `{"flow": {...}}`, as JSON text
 * or parsed. Null when the answer doesn't report a failure. A non-JSON answer is taken as the message itself.
 */
export function flowFailureOf(answer: unknown): FlowFailure | null {
  const flow = parsedFlow(answer);
  if (flow === undefined) {
    const text = typeof answer === 'string' ? answer.trim() : '';
    return text ? { summary: text, steps: [] } : null;
  }
  const steps: Array<{ uri?: string; message: string; status?: string }> = Array.isArray(flow?.steps) ? flow.steps : [];
  const failedSteps = steps.filter(step => step?.status === 'error').map(step => ({ uri: step.uri || undefined, message: step.message ?? 'Failed.' }));
  const installed = flow?.installed;
  const failed = flow?.status === 'failed' || flow?.status === 'error' || failedSteps.length > 0 || Number(installed?.failed) > 0;
  if (!failed) {
    return null;
  }
  const summary =
    installed?.total != null && installed?.failed != null
      ? `${installed.failed} of ${installed.total} Steps failed to start.`
      : (flow?.message ?? DEFAULT_FAILURE);
  return { summary, steps: failedSteps };
}

/** The failure of a call that failed: what its answer says, or a general message when it says nothing. */
export function failureOfError(error: unknown): FlowFailure {
  return flowFailureOf(error) ?? { summary: DEFAULT_FAILURE, steps: [] };
}

/** The `flow` object of a runtime answer; undefined when the answer isn't one. */
function parsedFlow(answer: unknown): any {
  let value = answer;
  if (typeof answer === 'string') {
    try {
      value = JSON.parse(answer);
    } catch {
      return undefined;
    }
  }
  return value && typeof value === 'object' && 'flow' in value ? (value as { flow: unknown }).flow : undefined;
}

/** The event in a runtime answer, such as `started` in `{"flow": {"event": "started"}}`. */
export function flowEventOf(answer: unknown): string | undefined {
  return parsedFlow(answer)?.event;
}
