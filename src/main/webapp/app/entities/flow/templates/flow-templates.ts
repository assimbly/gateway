import { IStep, StepType } from 'app/shared/model/step.model';

import { DesignLink, DesignStep, FlowGraph, StepKind, newFlowGraph } from '../designer/flow-graph';

/**
 * An Example Flow: a small, ready-made Visual Flow that opens in the editor as a new, unsaved Flow. Paths that only
 * the user can know, such as folders, are left empty, so the Flow opens as a Draft that points at what to fill in.
 */
export interface FlowTemplate {
  id: string;
  title: string;
  description: string;
  steps: TemplateStep[];
  links: DesignLink[];
}

interface TemplateStep {
  key: string;
  kind: StepKind;
  componentType: string;
  uri?: string;
  options?: string;
}

const link = (from: string, to: string, branch: Partial<DesignLink> = {}): DesignLink => ({ from, to, transport: 'sync', ...branch });

export const FLOW_TEMPLATES: readonly FlowTemplate[] = [
  {
    id: 'folder-to-folder',
    title: 'Folder to folder',
    description: 'Picks up each file from one folder and writes it to another.',
    steps: [
      { key: 'example-source', kind: 'SOURCE', componentType: 'file' },
      { key: 'example-sink', kind: 'SINK', componentType: 'file' },
    ],
    links: [link('example-source', 'example-sink')],
  },
  {
    id: 'scheduled-http-poll',
    title: 'Scheduled HTTP call',
    description: 'Calls a URL every minute and writes each answer to a folder.',
    steps: [
      { key: 'example-source', kind: 'SOURCE', componentType: 'timer', uri: 'every-minute', options: 'period=60000' },
      { key: 'example-call', kind: 'ACTION', componentType: 'http' },
      { key: 'example-sink', kind: 'SINK', componentType: 'file' },
    ],
    links: [link('example-source', 'example-call'), link('example-call', 'example-sink')],
  },
  {
    id: 'route-by-content',
    title: 'Route by content',
    description: "Sends files that contain 'urgent' to one folder and all others to another.",
    steps: [
      { key: 'example-source', kind: 'SOURCE', componentType: 'file' },
      { key: 'example-router', kind: 'ROUTER', componentType: 'content' },
      { key: 'example-urgent', kind: 'SINK', componentType: 'file' },
      { key: 'example-other', kind: 'SINK', componentType: 'file' },
    ],
    links: [
      link('example-source', 'example-router'),
      link('example-router', 'example-urgent', { rule: 'urgent', language: 'simple', expression: "${body} contains 'urgent'" }),
      // The Default branch is the one without a Branch name.
      link('example-router', 'example-other'),
    ],
  },
];

export function flowTemplate(id: string | null | undefined): FlowTemplate | undefined {
  return FLOW_TEMPLATES.find(template => template.id === id);
}

/** The Example Flow as a Flow graph for the canvas, with each Step as the editor's forms read it, by key. */
export function templateFlow(template: FlowTemplate): { graph: FlowGraph; steps: Map<string, IStep> } {
  const designSteps: DesignStep[] = template.steps.map(({ key, kind, componentType, uri, options }) => ({ key, kind, componentType, uri, options }));
  const steps = new Map<string, IStep>(
    template.steps.map(({ key, kind, componentType, uri, options }) => [key, { stepType: kind as StepType, componentType, uri: uri ?? '', options: options ?? '' }]),
  );
  return { graph: newFlowGraph(designSteps, template.links.map(l => ({ ...l }))), steps };
}
