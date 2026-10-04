import { IStep, Step, StepType } from 'app/shared/model/step.model';

/** A new Flow's Error Handler logs the failed message at level ERROR, with everything about it. */
export const DEFAULT_ERROR_HANDLER = { componentType: 'log', options: 'level=ERROR&showAll=true' } as const;

/** A new Error Handler Step that logs, as a new Flow gets it. Its path is filled in when the Flow is saved. */
export function defaultErrorHandlerStep(): Step {
  const step = new Step();
  step.stepType = StepType.ERROR;
  step.componentType = DEFAULT_ERROR_HANDLER.componentType;
  step.uri = '';
  step.options = DEFAULT_ERROR_HANDLER.options;
  return step;
}

/** The logger a logging Error Handler writes to: FlowName/FlowID. */
export function errorHandlerPath(flowName: string | null | undefined, flowId: number | null | undefined): string {
  return `${flowName ?? ''}/${flowId ?? ''}`;
}

/**
 * Whether a logging Error Handler's path is still the automatic one: empty, or FlowName/FlowID for the name the Flow
 * was last saved with. Such a path follows the Flow's name and id; a path the user typed is kept as it is.
 */
function followsFlow(
  handler: Pick<IStep, 'componentType' | 'uri'>,
  flowId: number | null | undefined,
  savedName: string | null | undefined,
): boolean {
  if (handler.componentType?.toLowerCase() !== DEFAULT_ERROR_HANDLER.componentType) {
    return false;
  }
  return !handler.uri || (!!flowId && handler.uri === errorHandlerPath(savedName, flowId));
}

/** The path a logging Error Handler gets when the Flow is saved: FlowName/FlowID while it still follows the Flow. */
export function errorHandlerPathOnSave(
  handler: Pick<IStep, 'componentType' | 'uri'>,
  flow: { name?: string | null; id?: number | null },
  previousName: string | null | undefined,
): string | null | undefined {
  return flow.id && followsFlow(handler, flow.id, previousName) ? errorHandlerPath(flow.name, flow.id) : handler.uri;
}

/**
 * The path to show as automatic while editing, from the name being typed; FlowID stands in for the id of a Flow that
 * isn't saved yet. Undefined when the Error Handler doesn't log, or logs to a path of the user's own.
 */
export function automaticErrorHandlerPath(
  handler: Pick<IStep, 'componentType' | 'uri'>,
  flow: { name?: string | null; id?: number | null },
  savedName: string | null | undefined,
): string | undefined {
  return followsFlow(handler, flow.id, savedName) ? `${flow.name || 'FlowName'}/${flow.id ?? 'FlowID'}` : undefined;
}
