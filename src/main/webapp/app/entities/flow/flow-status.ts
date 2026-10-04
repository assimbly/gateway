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
  /** The Flow status in words, or Draft, which isn't a Flow status: a Draft can't run. */
  label: 'Running' | 'Paused' | 'Stopped' | 'Error' | 'Draft';
  tone: StatusControlsTone;
  draft: boolean;
  /** The one obvious thing to do; none for a Draft, which has to be finished first. */
  mainAction: FlowAction | null;
  /** The other actions that fit the state, for the row's ⋮ menu. */
  menuActions: FlowAction[];
}

const BY_STATUS: Record<RuntimeStatus, Omit<FlowStatusView, 'draft'>> = {
  active: { label: 'Running', tone: 'started', mainAction: 'stop', menuActions: ['pause', 'restart'] },
  paused: { label: 'Paused', tone: 'paused', mainAction: 'resume', menuActions: ['stop', 'restart'] },
  inactive: { label: 'Stopped', tone: 'default', mainAction: 'start', menuActions: [] },
  inactiveError: { label: 'Error', tone: 'failed', mainAction: 'start', menuActions: [] },
};

/** What a Flows list row shows for a Flow's runtime state. A Draft that is still running keeps its Flow status, so it can be stopped. */
export function flowStatusView(status: RuntimeStatus, draft: boolean): FlowStatusView {
  const running = status === 'active' || status === 'paused';
  if (draft && !running) {
    return { label: 'Draft', tone: 'default', draft: true, mainAction: null, menuActions: [] };
  }
  return { ...BY_STATUS[status], draft: false };
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
