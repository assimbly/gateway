import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { loadFlowGraph } from './designer/flow-graph';
import { compactCount, countsByStepKey, flowStatsSections, stepStatsSections } from './flow-stats';
import { IFlowStats } from './flow.service';

const flow: IFlow = {
  id: 1,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'timer', links: [{ name: '1-11', bound: 'out' }] },
    { id: 11, stepType: 'SINK', componentType: 'log', links: [{ name: '1-11', bound: 'in' }] },
  ] as IStep[],
};

const stats: IFlowStats = {
  id: '1',
  status: 'started',
  uptimeMillis: 3_723_000,
  lastCompleted: 0,
  meanProcessingTime: 4,
  maxProcessingTime: 9,
  lastProcessingTime: 3,
  transactionsTotal: 3,
  transactionsCompleted: 2,
  transactionsFailed: 1,
  transactionsPending: 0,
  exchangesTotal: 6,
  exchangesCompleted: 4,
  exchangesFailed: 2,
  exchangesPending: 0,
};

const rowsOf = (section: { rows: Array<{ label: string; values: string[] }> }) => section.rows.map(row => [row.label, ...row.values]);

describe('Flow stats', () => {
  it('shows a Flow’s runtime, messages and processing times', () => {
    const [runtime, messages, times] = flowStatsSections(stats);

    expect(rowsOf(runtime)).toEqual([
      ['Status', 'Started'],
      ['Running for', '1 hour 2 minutes 3 seconds'],
      ['Last completed', '—'],
      ['Last failed', '—'],
    ]);
    expect(messages.columns).toEqual(['Transactions', 'Exchanges']);
    expect(rowsOf(messages)[3]).toEqual(['Failed', '1', '2']);
    expect(rowsOf(times)).toEqual([
      ['Average', '4 ms'],
      ['Maximum', '9 ms'],
      ['Last', '3 ms'],
    ]);
  });

  it('shows no processing times before a message went through', () => {
    const times = flowStatsSections({ ...stats, transactionsTotal: 0 })[2];

    expect(times.rows.map(row => row.values[0])).toEqual(['—', '—', '—']);
  });

  it('shows a Step’s messages, and its processing times once they are read', () => {
    const counts = { total: 5, completed: 3, failed: 1, pending: 1 };

    expect(stepStatsSections(counts, undefined).map(section => section.title)).toEqual(['Messages']);

    const [messages, times] = stepStatsSections(counts, { id: '1-10', stats: { meanProcessingTime: 2, maxProcessingTime: 7, lastProcessingTime: 1 } });
    expect(rowsOf(messages)).toEqual([
      ['Total', '5'],
      ['Completed', '3'],
      ['Pending', '1'],
      ['Failed', '1'],
    ]);
    expect(rowsOf(times)).toEqual([
      ['Average', '2 ms'],
      ['Maximum', '7 ms'],
      ['Last', '1 ms'],
    ]);
  });

  it('shows zero messages for a Step the runtime has no counts of', () => {
    expect(rowsOf(stepStatsSections(undefined, undefined)[0]).map(row => row[1])).toEqual(['0', '0', '0', '0']);
  });

  it('gives each Step on the canvas its counts, adding up the routes of one Step', () => {
    const counts = countsByStepKey(loadFlowGraph(flow), [
      { id: '10', total: 4, completed: 3, failed: 1, pending: 0 },
      { id: '11', total: 2, completed: 2, failed: 0, pending: 0 },
      { id: '11-response', total: 1, completed: 0, failed: 1, pending: 0 },
      { id: '99', total: 7, completed: 7, failed: 0, pending: 0 },
    ]);

    expect([...counts.entries()]).toEqual([
      ['step-10', { total: 4, completed: 3, failed: 1, pending: 0 }],
      ['step-11', { total: 3, completed: 2, failed: 1, pending: 0 }],
    ]);
  });

  it('shortens a count for a badge', () => {
    expect([0, 999, 1000, 1234, 9999, 12_345, 999_999, 3_456_789, 45_000_000].map(compactCount)).toEqual([
      '0',
      '999',
      '1k',
      '1.2k',
      '9.9k',
      '12k',
      '999k',
      '3.4M',
      '45M',
    ]);
  });
});
