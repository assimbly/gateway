import { TutorialSummary } from './tutorial.model';
import { OTHER_TRACK, groupByTrack } from './tutorial-tracks';

const tutorial = (id: string, track?: string): TutorialSummary => ({ id, title: id, minutes: 10, track, fixtures: {} });

describe('Tutorial tracks', () => {
  it('groups the tutorials by track, in the order they are listed', () => {
    const tracks = groupByTrack([tutorial('quick-start', 'Get started'), tutorial('t1', 'Get started'), tutorial('t2', 'Connect'), tutorial('t3', 'Connect')]);

    expect(tracks.map(track => [track.name, track.tutorials.map(t => t.id)])).toEqual([
      ['Get started', ['quick-start', 't1']],
      ['Connect', ['t2', 't3']],
    ]);
  });

  it('lists a tutorial without a track under More tutorials', () => {
    expect(groupByTrack([tutorial('t9')])).toEqual([{ name: OTHER_TRACK, tutorials: [tutorial('t9')] }]);
  });
});
