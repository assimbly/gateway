import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { loadFlowGraph } from '../designer/flow-graph';
import { FlowTestRun, StepRun, entryStepOf, graphShape, headersOf, runResultsByStepKey, shortDuration } from './flow-test-run';

const flow: IFlow = {
  id: 1,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'file', uri: 'in', links: [{ name: '1-11', bound: 'out' }] },
    { id: 11, stepType: 'ACTION', componentType: 'setbody', links: [{ name: '1-11', bound: 'in' }, { name: '1-12', bound: 'out' }] },
    { id: 12, stepType: 'SINK', componentType: 'file', uri: 'out', links: [{ name: '1-12', bound: 'in' }] },
  ] as IStep[],
};

const message = { body: 'Hello', headers: {}, truncated: false };

function stepRun(stepId: string, status: StepRun['status'] = 'completed'): StepRun {
  return { stepId, status, startedAt: '2026-10-23T10:00:00Z', ownMillis: 2, totalMillis: 5, in: message, out: status === 'completed' ? message : null };
}

function run(steps: StepRun[]): FlowTestRun {
  return { runId: 'r1', status: 'completed', durationMillis: 5, response: message, steps };
}

describe('Flow test run', () => {
  it('starts at the Step the Source links to', () => {
    expect(entryStepOf(loadFlowGraph(flow))).toBe('11');
  });

  it('has no place to start until the Step after the Source is saved', () => {
    const graph = loadFlowGraph(flow);
    graph.steps[1] = { ...graph.steps[1], id: undefined };

    expect(entryStepOf(graph)).toBeUndefined();
    expect(entryStepOf(loadFlowGraph({ id: 2, steps: [] }))).toBeUndefined();
  });

  it('marks the Source as the test input, each Step that ran, and the Steps the message never reached', () => {
    const marks = runResultsByStepKey(loadFlowGraph(flow), run([stepRun('11', 'failed')]));

    expect(marks.get('step-10')).toBe('input');
    expect(marks.get('step-11')).toEqual(expect.objectContaining({ stepId: '11', status: 'failed' }));
    expect(marks.get('step-12')).toBe('unreached');
  });

  it('finds a Step added in this editor by its saved id, though it keeps its new key', () => {
    const graph = loadFlowGraph(flow);
    graph.steps[2] = { ...graph.steps[2], key: 'new-3' };

    expect(runResultsByStepKey(graph, run([stepRun('11'), stepRun('12')])).get('new-3')).toEqual(expect.objectContaining({ stepId: '12' }));
  });

  it('shows the failed run of a Step that ran more than once', () => {
    const marks = runResultsByStepKey(loadFlowGraph(flow), run([stepRun('11'), stepRun('11', 'failed'), stepRun('11')]));

    expect(marks.get('step-11')).toEqual(expect.objectContaining({ status: 'failed' }));
  });

  it("doesn't see moving a Step as a change of the Flow, but does see a change of its settings", () => {
    const graph = loadFlowGraph(flow);
    const moved = { ...graph, steps: graph.steps.map(step => ({ ...step, x: (step.x ?? 0) + 50 })) };
    const changed = { ...graph, steps: graph.steps.map(step => (step.key === 'step-12' ? { ...step, uri: 'elsewhere' } : step)) };

    expect(graphShape(moved)).toBe(graphShape(graph));
    expect(graphShape(changed)).not.toBe(graphShape(graph));
  });

  it.each([
    [0, '0 ms'],
    [12.4, '12 ms'],
    [1440, '1.4 s'],
    [125_000, '2 min'],
  ])('says %d milliseconds as %s', (millis, text) => {
    expect(shortDuration(millis)).toBe(text);
  });

  it('sends the headers that have a name', () => {
    expect(headersOf([{ key: ' Id ', value: '7' }, { key: '', value: 'lost' }, { key: 'Empty' }])).toEqual({ Id: '7', Empty: '' });
  });
});
