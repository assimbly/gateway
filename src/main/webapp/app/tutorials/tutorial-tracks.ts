import { TutorialSummary } from './tutorial.model';

/** A track of the Tutorials panel: tutorials that build on each other, such as Get started. */
export interface TutorialTrack {
  name: string;
  tutorials: TutorialSummary[];
}

/** The track of a tutorial that doesn't name one. */
export const OTHER_TRACK = 'More tutorials';

/** The tutorials grouped by track, the tracks and the tutorials within each in the order index.json lists them. */
export function groupByTrack(summaries: TutorialSummary[]): TutorialTrack[] {
  const tracks = new Map<string, TutorialSummary[]>();
  for (const summary of summaries) {
    const name = summary.track?.trim() || OTHER_TRACK;
    tracks.set(name, [...(tracks.get(name) ?? []), summary]);
  }
  return [...tracks].map(([name, tutorials]) => ({ name, tutorials }));
}
