import { IFlow } from 'app/shared/model/flow.model';

import { traceCollector } from './collectors';

describe('Trace collector', () => {
  const flow: IFlow = {
    id: 5916,
    version: 3,
    steps: [
      { id: 6452, stepType: 'SOURCE' },
      { id: 6453, stepType: 'ACTION' },
      { id: 6454, stepType: 'SINK' },
      { id: 6455, stepType: 'ERROR' },
    ] as IFlow['steps'],
  };

  it('is a step collector the runtime accepts, writing to the log', () => {
    expect(traceCollector(flow)).toMatchObject({
      id: '5916',
      type: 'step',
      flowId: '5916',
      flowVersion: '3',
      events: ['StepCompleted', 'StepFailed'],
      stores: [{ type: 'console' }],
    });
  });

  it('traces every Step but the Error Step, by the plain Step id that step events carry', () => {
    expect(traceCollector(flow).filters).toEqual([
      { id: '6452', filter: '6452' },
      { id: '6453', filter: '6453' },
      { id: '6454', filter: '6454' },
    ]);
  });

  it('has nothing to trace in a Flow without Steps', () => {
    expect(traceCollector({ id: 1 }).filters).toEqual([]);
  });
});
