import { IFlow } from 'app/shared/model/flow.model';

/** A runtime event collector, as the runtime's collector endpoint takes it. */
export interface Collector {
  id: string;
  type: 'step' | 'route' | 'log';
  flowId: string;
  flowVersion: string;
  events: string[];
  stores: { type: string }[];
  filters: { id: string; filter: string }[];
}

/**
 * The collector behind a Flow's Trace setting: the message after each Step, written to the log (and so to the Log viewer).
 * Step events carry the plain Step id, so that is what the filters match. The Error Step isn't traced.
 */
export function traceCollector(flow: IFlow): Collector {
  const stepIds = (flow.steps ?? []).filter(step => step.stepType !== 'ERROR' && step.id != null).map(step => String(step.id));
  return {
    id: String(flow.id),
    type: 'step',
    flowId: String(flow.id),
    flowVersion: String(flow.version ?? ''),
    events: ['StepCompleted', 'StepFailed'],
    stores: [{ type: 'console' }],
    filters: stepIds.map(id => ({ id, filter: id })),
  };
}
