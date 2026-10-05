import { RuntimeStatus } from 'app/entities/flow/flow-status';
import { StatusControlsTone } from 'app/shared/table';

/** An API's status: a summary of its Handler Flows' Flow statuses. An API has no status of its own. */
export interface ApiStatus {
  running: number;
  total: number;
  errors: number;
  drafts: number;
  label: string;
  tone: StatusControlsTone;
}

export function apiStatus(handlerFlows: { status: RuntimeStatus | undefined; draft: boolean }[]): ApiStatus {
  const total = handlerFlows.length;
  const running = handlerFlows.filter(f => f.status === 'active').length;
  const errors = handlerFlows.filter(f => f.status === 'inactiveError').length;
  const drafts = handlerFlows.filter(f => f.draft).length;
  if (!total) {
    return { running, total, errors, drafts, label: 'No Operations yet', tone: 'default' };
  }
  const parts = [`${running} of ${total} ${total === 1 ? 'Operation' : 'Operations'} running`];
  if (errors) {
    parts.push(`${errors} ${errors === 1 ? 'Error' : 'Errors'}`);
  }
  if (drafts) {
    parts.push(`${drafts} ${drafts === 1 ? 'Draft' : 'Drafts'}`);
  }
  const tone: StatusControlsTone = errors ? 'failed' : running === total ? 'started' : 'default';
  return { running, total, errors, drafts, label: parts.join(', '), tone };
}
