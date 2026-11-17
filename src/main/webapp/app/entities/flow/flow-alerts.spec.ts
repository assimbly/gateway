import 'app/config/dayjs';

import { failureLines, parseAlert } from './flow-alerts';

describe('Flow alerts', () => {
  describe('parseAlert', () => {
    it('reads a failed message the runtime wrote', () => {
      const alert = parseAlert('2026-03-06 09:53:13 +0100 : Cannot store file: C:\\messages\\out2\\a.txt');

      expect(alert.kind).toBe('message');
      expect(alert.title).toBe('Failed message');
      expect(alert.endpoint).toBeUndefined();
      expect(alert.message).toBe('Cannot store file: C:\\messages\\out2\\a.txt');
      expect(alert.at?.toISOString()).toBe('2026-03-06T08:53:13.000Z');
    });

    it('reads a failed start with the Endpoint of its Step', () => {
      const alert = parseAlert('2026-10-24 10:12:03 +0200 : Failed to start [file://in?noop=true]: Multiple consumers for the same endpoint');

      expect(alert).toMatchObject({ kind: 'flow', title: 'Failed to start', endpoint: 'file://in?noop=true', message: 'Multiple consumers for the same endpoint' });
    });

    it('reads a Flow that failed without a Step', () => {
      expect(parseAlert('2026-10-24 10:12:03 +0200 : Failed to configure: Bad configuration')).toMatchObject({
        kind: 'flow',
        title: 'Failed to configure',
        message: 'Bad configuration',
      });
    });

    it('keeps a line without a time as the message', () => {
      const alert = parseAlert('Something odd : happened');

      expect(alert.at).toBeUndefined();
      expect(alert).toMatchObject({ kind: 'message', message: 'Something odd : happened' });
    });
  });

  describe('failureLines', () => {
    it('gives a line per failed Step, with its Endpoint when known', () => {
      const lines = failureLines('start', {
        summary: '2 of 3 Steps failed to start.',
        steps: [
          { id: '1', uri: 'file://in', message: 'Busy' },
          { id: '2', message: 'Failed.' },
        ],
      });

      expect(lines).toEqual(['Failed to start [file://in]: Busy', 'Failed to start: Failed.']);
      expect(lines.map(parseAlert).map(alert => alert.endpoint)).toEqual(['file://in', undefined]);
    });

    it('gives the summary when no Step is named', () => {
      expect(failureLines('restart', { summary: 'The Flow could not be started.', steps: [] })).toEqual([
        'Failed to restart: The Flow could not be started.',
      ]);
    });
  });
});
