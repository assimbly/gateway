import { countLabel, flowTypeLabel, hasRun, rowStatus, runtimeStatusOf, testMessageBlocked } from './flow-row-status';

describe('Flows list row status', () => {
  it.each([
    ['active', 'Running', 'started', 'stop', ['pause', 'restart']],
    ['paused', 'Paused', 'paused', 'resume', ['stop', 'restart']],
    ['inactive', 'Stopped', 'default', 'start', []],
    ['inactiveError', 'Error', 'failed', 'start', []],
  ] as const)('shows a %s Flow as %s, with one main action and the rest in the menu', (status, label, tone, mainAction, menuActions) => {
    expect(rowStatus(status, false)).toEqual({ label, tone, draft: false, mainAction, menuActions });
  });

  it.each(['inactive', 'inactiveError'] as const)('shows a %s Draft as a Draft to finish, which it can not start', status => {
    expect(rowStatus(status, true)).toEqual({ label: 'Draft', tone: 'default', draft: true, mainAction: null, menuActions: [] });
  });

  it('keeps showing the Flow status of a Draft that is still running, so it can be stopped', () => {
    expect(rowStatus('active', true)).toMatchObject({ label: 'Running', draft: false, mainAction: 'stop' });
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
});
