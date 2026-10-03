import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { deleteStep, insertStep, loadFlowGraph } from './flow-graph';
import { FlowGraphHistory } from './flow-graph-history';

const sourceToSink = (): IFlow => ({
  id: 1,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'timer', links: [{ name: '1-11', bound: 'out' }] },
    { id: 11, stepType: 'SINK', componentType: 'log', links: [{ name: '1-11', bound: 'in' }] },
  ] as IStep[],
});

describe('Flow graph history', () => {
  it('undoes and redoes accepted edits', () => {
    const history = new FlowGraphHistory(loadFlowGraph(sourceToSink()));

    history.apply(insertStep(history.current, 'step-11', 'ACTION', 'setbody'));
    expect(history.current.steps).toHaveLength(3);

    history.undo();
    expect(history.current.steps).toHaveLength(2);

    history.redo();
    expect(history.current.steps).toHaveLength(3);
  });

  it('ignores rejected edits and passes on why they were rejected', () => {
    const history = new FlowGraphHistory(loadFlowGraph(sourceToSink()));

    const result = history.apply(deleteStep(history.current, 'step-10'));

    expect(result.outcome).toBe('rejected');
    expect(history.canUndo).toBe(false);
  });

  it('forgets what could be redone once a new edit is made', () => {
    const history = new FlowGraphHistory(loadFlowGraph(sourceToSink()));
    history.apply(insertStep(history.current, 'step-11', 'ACTION', 'setbody'));
    history.undo();

    history.apply(insertStep(history.current, 'step-11', 'ACTION', 'setheaders'));

    expect(history.canRedo).toBe(false);
  });

  it('knows whether there are unsaved changes', () => {
    const history = new FlowGraphHistory(loadFlowGraph(sourceToSink()));
    expect(history.hasUnsavedChanges).toBe(false);

    history.apply(insertStep(history.current, 'step-11', 'ACTION', 'setbody'));
    expect(history.hasUnsavedChanges).toBe(true);

    history.markSaved();
    expect(history.hasUnsavedChanges).toBe(false);

    history.undo();
    expect(history.hasUnsavedChanges).toBe(true);
  });
});
