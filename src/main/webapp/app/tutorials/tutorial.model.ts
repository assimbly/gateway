/** A tutorial as index.json lists it: enough to offer it in the panel without loading it. */
export interface TutorialSummary {
  id: string;
  title: string;
  minutes: number;
  /** The Flows the tutorial starts from, by name, with the DIL file next to the tutorial that adds each one. */
  fixtures: Record<string, string>;
}

/** One page of a tutorial in the panel: a `##` section of its Markdown, or its introduction. */
export interface TutorialStep {
  title: string;
  /** The section rendered as HTML, with a Show me button for each `<!-- show: selector -->`. */
  html: string;
  /** What ticks the step off, such as `flowStatus:ExampleFlow:started`; without one the user moves on themselves. */
  check?: string;
}

export interface Tutorial extends TutorialSummary {
  steps: TutorialStep[];
}
