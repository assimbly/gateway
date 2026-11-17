import { FlowGraph } from '../designer/flow-graph';

/** A message as a test run saw it. Long bodies are cut short, and secret header values are masked. */
export interface TestMessage {
  body: string;
  headers: Record<string, string>;
  truncated: boolean;
}

export type StepRunStatus = 'completed' | 'failed' | 'running';

/** What one Step did with the test message. `ownMillis` leaves out the Steps after it; `totalMillis` doesn't. */
export interface StepRun {
  stepId: string;
  status: StepRunStatus;
  startedAt: string;
  ownMillis: number;
  totalMillis: number;
  in: TestMessage;
  out: TestMessage | null;
  error?: string | null;
}

/** The answer to a test run: what came back and what each Step did, in the order the Steps started. */
export interface FlowTestRun {
  runId: string;
  status: 'completed' | 'failed';
  durationMillis: number;
  response: TestMessage | null;
  error?: string | null;
  steps: StepRun[];
}

/** A test run starts at the Step the Source links to, so the message doesn't go through the Source's endpoint. */
export interface TestRunRequest {
  entryStepId: string;
  body: string;
  headers: Record<string, string>;
}

/** What a Step shows after a test run: what it did, that it gave the test input (the Source), or that the message never got there. */
export type StepRunMark = StepRun | 'input' | 'unreached';

/** The saved id of the Step the Source links to, where a test run starts; undefined until that Step is saved and linked. */
export function entryStepOf(graph: FlowGraph): string | undefined {
  const source = graph.steps.find(step => step.kind === 'SOURCE');
  const link = source && graph.links.find(l => l.from === source.key);
  const entry = link && graph.steps.find(step => step.key === link.to);
  return entry?.id != null ? String(entry.id) : undefined;
}

/** What each Step did in the run, by its saved id. A Step that ran more than once, as in a split, shows a failed run if it had one, else its first. */
export function stepRunsById(run: FlowTestRun): Map<string, StepRun> {
  const runs = new Map<string, StepRun>();
  run.steps.forEach(stepRun => {
    const known = runs.get(stepRun.stepId);
    if (!known || (known.status !== 'failed' && stepRun.status === 'failed')) {
      runs.set(stepRun.stepId, stepRun);
    }
  });
  return runs;
}

/**
 * What each Step of the graph did in the run, by Step key. Steps are matched by their saved id, since a Step added
 * in this editor keeps its `new-N` key after saving.
 */
export function runResultsByStepKey(graph: FlowGraph, run: FlowTestRun): Map<string, StepRunMark> {
  const runs = stepRunsById(run);
  const marks = new Map<string, StepRunMark>();
  graph.steps.forEach(step => {
    if (step.kind === 'SOURCE') {
      marks.set(step.key, 'input');
    } else if (step.id != null) {
      marks.set(step.key, runs.get(String(step.id)) ?? 'unreached');
    }
  });
  return marks;
}

/** What a test run depends on in the graph: its Steps, their settings and Links, but not where they are placed. */
export function graphShape(graph: FlowGraph): string {
  return JSON.stringify({ steps: graph.steps.map(({ x, y, ...step }) => step), links: graph.links });
}

/** A duration short enough for a badge: 12 ms, 1.4 s, 2 min. */
export function shortDuration(millis: number): string {
  if (millis < 1000) {
    return `${Math.max(0, Math.round(millis))} ms`;
  }
  if (millis < 60_000) {
    return `${Math.round(millis / 100) / 10} s`;
  }
  return `${Math.round(millis / 60_000)} min`;
}

/** The headers a test message is sent with: those with a name, by name. */
export function headersOf(headers: { key?: string; value?: string }[]): Record<string, string> {
  const named: Record<string, string> = {};
  headers.forEach(header => {
    const name = header.key?.trim();
    if (name) {
      named[name] = header.value ?? '';
    }
  });
  return named;
}
