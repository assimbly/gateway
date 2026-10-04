import { IStep } from 'app/shared/model/step.model';

import {
  countLabel,
  failureOfError,
  flowFailureOf,
  flowTypeLabel,
  hasRun,
  flowStatusView,
  runtimeStatusOf,
  sourceStepOf,
  testMessageBlocked,
} from './flow-status';

describe('Flows list row status', () => {
  it.each([
    ['active', 'Running', 'started', ['pause', 'stop', 'restart'], []],
    ['paused', 'Paused', 'paused', ['resume', 'stop', 'restart'], []],
    ['inactive', 'Stopped', 'default', ['start', 'pause', 'stop'], ['pause', 'stop']],
    ['inactiveError', 'Error', 'failed', ['start', 'pause', 'stop'], ['pause', 'stop']],
  ] as const)('shows a %s Flow as %s with the controls that fit it', (status, label, tone, controls, disabled) => {
    expect(flowStatusView(status, false)).toEqual({ label, tone, draft: false, controls, disabled });
  });

  it.each(['inactive', 'inactiveError'] as const)('marks a %s Draft, which it can not start', status => {
    expect(flowStatusView(status, true)).toMatchObject({ draft: true, controls: ['start', 'pause', 'stop'], disabled: ['start', 'pause', 'stop'] });
  });

  it('lets a Draft that is still running be stopped', () => {
    expect(flowStatusView('active', true)).toMatchObject({ label: 'Running', draft: true, controls: ['pause', 'stop', 'restart'], disabled: [] });
  });

  it('shows — for a Flow that never ran, and the count, 0 included, once it has', () => {
    expect(countLabel(undefined, false)).toBe('—');
    expect(countLabel(undefined, true)).toBe('0');
    expect(countLabel(0, true)).toBe('0');
    expect(countLabel(42, true)).toBe('42');
  });

  it.each([
    ['unconfigured', false],
    ['', false],
    ['started', true],
    ['stopped', true],
    ['error', true],
  ])('counts a Flow whose runtime status is "%s" as having run: %s', (runtimeStatus, ran) => {
    expect(hasRun(runtimeStatus)).toBe(ran);
  });

  it.each([
    ['started', 'active'],
    ['resumed', 'active'],
    ['restarted', 'active'],
    ['suspended', 'paused'],
    ['paused', 'paused'],
    ['stopped', 'inactive'],
    ['unconfigured', 'inactive'],
    ['error', 'inactiveError'],
    ['failed', 'inactiveError'],
  ])('reads the runtime status "%s" as %s', (reported, status) => {
    expect(runtimeStatusOf(reported)).toBe(status);
  });

  it('lets a test message go to the Source of a running Flow', () => {
    expect(testMessageBlocked('active', { name: 'file', title: 'File', consumerOnly: false })).toBeNull();
  });

  it.each(['inactive', 'paused', 'inactiveError'] as const)('blocks a test message while the Flow is %s', status => {
    expect(testMessageBlocked(status, { name: 'file', title: 'File', consumerOnly: false })).toBe(
      'Start the Flow to send it a test message.',
    );
  });

  it('blocks a test message to a Flow without a Source, such as a Route Flow', () => {
    expect(testMessageBlocked('active', null)).toBe('This Flow has no Source to send a test message to.');
  });

  it('finds the Source among the Steps, also as the older FROM Step', () => {
    expect(sourceStepOf([{ stepType: 'SINK' }, { stepType: 'SOURCE', componentType: 'file' }] as IStep[])?.componentType).toBe('file');
    expect(sourceStepOf([{ stepType: 'FROM', componentType: 'sftp' }] as IStep[])?.componentType).toBe('sftp');
    expect(sourceStepOf([{ stepType: 'ROUTE' }] as IStep[])).toBeUndefined();
  });

  it('blocks a test message to a Source whose Component only receives, such as a Scheduler', () => {
    expect(testMessageBlocked('active', { name: 'scheduler', title: 'Scheduler', consumerOnly: true })).toBe(
      "A test message can't be sent to a Scheduler Source.",
    );
  });

  it.each([
    ['flow', 'Visual'],
    [undefined, 'Visual'],
    ['script', 'Script'],
    ['route', 'Route'],
  ])('calls a Flow of type %s a %s Flow', (type, label) => {
    expect(flowTypeLabel(type)).toBe(label);
  });

  describe('a failed start', () => {
    const answer = JSON.stringify({
      flow: {
        installed: { total: 3, success: 2, failed: 1 },
        event: 'start',
        message: 'Start flow failed',
        steps: [
          { id: '1', type: 'error', uri: 'log:Hello/3404?level=ERROR&showAll=true', status: 'success' },
          { id: '2', type: 'routeTemplate', uri: 'file://C:\messages\in', status: 'error', message: 'Multiple consumers', trace: 'at ...' },
        ],
        status: 'failed',
      },
    });

    it('says how many Steps failed, and which, without the stack trace', () => {
      expect(flowFailureOf(answer)).toEqual({
        summary: '1 of 3 Steps failed to start.',
        steps: [{ uri: 'file://C:\messages\in', message: 'Multiple consumers' }],
      });
    });

    it('is no failure when the Flow started', () => {
      expect(flowFailureOf(JSON.stringify({ flow: { event: 'started', status: 'started' } }))).toBeNull();
    });

    it("uses the runtime's message when it doesn't count the Steps", () => {
      expect(flowFailureOf({ flow: { status: 'failed', message: 'Start flow failed' } })).toEqual({ summary: 'Start flow failed', steps: [] });
    });

    it('takes an answer that is not JSON as the message', () => {
      expect(failureOfError('Gateway timeout')).toEqual({ summary: 'Gateway timeout', steps: [] });
    });

    it('still reports a failure when the answer says nothing', () => {
      expect(failureOfError(undefined)).toEqual({ summary: 'The Flow could not be started.', steps: [] });
    });
  });
});
