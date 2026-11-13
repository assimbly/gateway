import { Step, StepType } from 'app/shared/model/step.model';

import { chainLinks } from './step-links';

describe('chainLinks', () => {
  const names = (flowId: number, steps: Step[]) => chainLinks(flowId, steps).map(link => `${link.stepId} ${link.bound} ${link.name}`);

  it('links each Step out under its own name and in under the name of the Step before it', () => {
    const steps = [new Step(11, StepType.SOURCE), new Step(12, StepType.ACTION), new Step(13, StepType.SINK)];

    expect(names(7, steps)).toEqual(['11 out 7-11', '12 out 7-12', '12 in 7-11', '13 in 7-12']);
    expect(chainLinks(7, steps).every(link => link.transport === 'sync' && link.id === undefined)).toBe(true);
  });

  it('leaves the Error handler out of the chain, wherever it is', () => {
    const steps = [new Step(11, StepType.ROUTE), new Step(19, StepType.ERROR), new Step(12, StepType.ROUTE)];

    expect(names(7, steps)).toEqual(['11 out 7-11', '12 out 7-12', '12 in 7-11']);
  });

  it('links a Script out only when another Step follows it', () => {
    const steps = [new Step(11, StepType.SOURCE), new Step(12, StepType.SCRIPT), new Step(13, StepType.SCRIPT), new Step(19, StepType.ERROR)];

    expect(names(7, steps)).toEqual(['11 out 7-11', '12 out 7-12', '12 in 7-11', '13 in 7-12']);
  });

  it('has no Links for a single Sink or an empty Flow', () => {
    expect(names(7, [new Step(11, StepType.SINK)])).toEqual([]);
    expect(names(7, [])).toEqual([]);
  });
});
