import { IFlow } from 'app/shared/model/flow.model';
import { ILink } from 'app/shared/model/link.model';
import { IStep } from 'app/shared/model/step.model';

export type StepKind = 'SOURCE' | 'ACTION' | 'ROUTER' | 'SINK';

/** A Step as placed on the canvas. `key` identifies it before it has a database id. */
export interface DesignStep {
  key: string;
  id?: number;
  kind: StepKind;
  componentType?: string;
  uri?: string;
  options?: string;
  connectionId?: number;
  messageId?: number;
  routeId?: number;
  responseId?: number;
  x?: number;
  y?: number;
}

/** A Link from one Step to another. A Step has at most one inbound Link, so `to` identifies the Link. */
export interface DesignLink {
  from: string;
  to: string;
  transport: string;
  pattern?: string;
  rule?: string;
  language?: string;
  expression?: string;
}

export interface FlowGraph {
  flowId?: number;
  steps: DesignStep[];
  links: DesignLink[];
  errorStep?: IStep;
  /** The saved Links did not form a complete Flow, so they were rebuilt as a chain in Step order. */
  repaired: boolean;
  /** Set when the Flow uses Step types the designer can't edit; the canvas then only shows it. */
  readOnlyReason?: string;
}

const KINDS: StepKind[] = ['SOURCE', 'ACTION', 'ROUTER', 'SINK'];

/**
 * Which Branches a kind of Router has.
 * A Fixed-slot Router has one named Branch plus the Default branch; a List Router has any number of equal Branches.
 */
export type RouterShape = { slots: 'fixed'; branch: string } | { slots: 'list'; hasDefault: boolean };

const ROUTER_SHAPES: Record<string, RouterShape> = {
  if: { slots: 'fixed', branch: 'if' },
  split: { slots: 'fixed', branch: 'split' },
  splitwithnamespace: { slots: 'fixed', branch: 'split' },
  splitandaggregate: { slots: 'fixed', branch: 'split' },
  splitandaggregatewithnamespace: { slots: 'fixed', branch: 'split' },
  enrich: { slots: 'fixed', branch: 'enrich' },
  wiretap: { slots: 'fixed', branch: 'wiretap' },
  loop: { slots: 'fixed', branch: 'loop' },
  dowhile: { slots: 'fixed', branch: 'dowhile' },
  content: { slots: 'list', hasDefault: true },
  dynamic: { slots: 'list', hasDefault: true },
  recipient: { slots: 'list', hasDefault: false },
  link: { slots: 'list', hasDefault: false },
};

/** The kinds of Router that can be inserted on the canvas. */
export const ROUTER_KINDS = Object.keys(ROUTER_SHAPES);

/** The kind of Router a Step is, such as 'if' or 'content'. Imported Steps keep it in the uri. */
export function routerKind(step: Pick<DesignStep, 'componentType' | 'uri'>): string {
  return (step.componentType || step.uri || '').toLowerCase().replace(/:.*$/, '');
}

/** Router kinds the shape table doesn't know are treated as List Routers without a Default branch. */
export function routerShape(step: Pick<DesignStep, 'componentType' | 'uri'>): RouterShape {
  return ROUTER_SHAPES[routerKind(step)] ?? { slots: 'list', hasDefault: false };
}

export function loadFlowGraph(flow: IFlow): FlowGraph {
  const flowSteps = flow.steps ?? [];
  const savedSteps: DesignStep[] = flowSteps.filter(s => KINDS.includes(s.stepType as StepKind)).map(toDesignStep);
  const steps = withPlaceholders(savedSteps);

  let links = linksFromSavedLinks(flowSteps, steps);
  const complete = steps.every(s => s.kind === 'SOURCE' || links.some(l => l.to === s.key));
  if (!complete) {
    links = chainInStepOrder(steps);
  }

  const unsupportedTypes = [...new Set(flowSteps.map(s => s.stepType as string).filter(t => !KINDS.includes(t as StepKind) && t !== 'ERROR'))];

  const graph: FlowGraph = {
    flowId: flow.id,
    steps,
    links,
    errorStep: flowSteps.find(s => s.stepType === 'ERROR'),
    repaired: !complete && savedSteps.length > 0,
    readOnlyReason: unsupportedTypes.length
      ? `This Flow uses Step types the designer can't edit: ${unsupportedTypes.join(', ')}.`
      : undefined,
  };
  return steps.every(s => s.x !== undefined && s.y !== undefined) ? graph : autoArrange(graph);
}

/** A Flow always has a Source and at least one Sink; missing ones are added unconfigured. */
function withPlaceholders(steps: DesignStep[]): DesignStep[] {
  const result = [...steps];
  if (!result.some(s => s.kind === 'SOURCE')) {
    result.unshift({ key: nextKey(), kind: 'SOURCE' });
  }
  if (!result.some(s => s.kind === 'SINK')) {
    result.push({ key: nextKey(), kind: 'SINK' });
  }
  return result;
}

let lastKey = 0;

/** Keys of new Steps are never reused, not even after undo, so the editor can keep each Step's form by key. */
function nextKey(): string {
  lastKey++;
  return `new-${lastKey}`;
}

/** Joins an outbound Link and an inbound Link with the same name into one Link. */
function linksFromSavedLinks(flowSteps: IStep[], steps: DesignStep[]): DesignLink[] {
  const designStep = (id: number | undefined): DesignStep | undefined => steps.find(d => d.id === id);
  const outboundByName = new Map<string, { from: DesignStep; link: ILink }>();
  for (const s of flowSteps) {
    const from = designStep(s.id);
    (s.links ?? []).filter(l => l.bound === 'out' && from).forEach(l => outboundByName.set(l.name!, { from: from!, link: l }));
  }

  const links: DesignLink[] = [];
  for (const s of flowSteps) {
    const to = designStep(s.id);
    for (const l of (s.links ?? []).filter(link => link.bound === 'in')) {
      const outbound = outboundByName.get(l.name!);
      if (outbound && to && !links.some(existing => existing.to === to.key)) {
        links.push(toDesignLink(outbound.from.key, to.key, outbound.link));
      }
    }
  }
  return links;
}

function chainInStepOrder(steps: DesignStep[]): DesignLink[] {
  const rank: Record<StepKind, number> = { SOURCE: 0, ACTION: 1, ROUTER: 1, SINK: 2 };
  const ordered = [...steps].sort((a, b) => rank[a.kind] - rank[b.kind] || (a.id ?? 0) - (b.id ?? 0));
  return ordered.slice(1).map((s, i) => toDesignLink(ordered[i].key, s.key, undefined));
}

function toDesignStep(step: IStep): DesignStep {
  return {
    key: `step-${step.id}`,
    id: step.id,
    kind: step.stepType as StepKind,
    componentType: step.componentType,
    uri: step.uri,
    options: step.options,
    connectionId: step.connectionId,
    messageId: step.messageId,
    routeId: step.routeId,
    responseId: step.responseId,
    x: step.coordinateX ?? undefined,
    y: step.coordinateY ?? undefined,
  };
}

function toDesignLink(from: string, to: string, link: ILink | undefined): DesignLink {
  return {
    from,
    to,
    transport: link?.transport || 'sync',
    pattern: link?.pattern || undefined,
    rule: link?.rule || undefined,
    language: link?.language || undefined,
    expression: link?.expression || undefined,
  };
}

export type EditResult = { outcome: 'accepted'; graph: FlowGraph } | { outcome: 'rejected'; reason: string };

const rejected = (reason: string): EditResult => ({ outcome: 'rejected', reason });
const accepted = (graph: FlowGraph): EditResult => ({ outcome: 'accepted', graph });
const plainLink = (from: string, to: string): DesignLink => ({ from, to, transport: 'sync' });

/**
 * Inserts a new Action or Router into the Link that leads to `linkTo`.
 * The upstream part of the Link (its Branch name, Condition and settings) now leads to the new Step.
 */
export function insertStep(graph: FlowGraph, linkTo: string, kind: 'ACTION' | 'ROUTER', componentType: string): EditResult {
  const link = graph.links.find(l => l.to === linkTo);
  if (!link) {
    return rejected('There is no Link to insert into.');
  }

  const from = graph.steps.find(s => s.key === link.from)!;
  const to = graph.steps.find(s => s.key === linkTo)!;
  const inserted: DesignStep = {
    key: nextKey(),
    kind,
    componentType,
    ...freePosition(graph.steps, midpoint(from.x, to.x), midpoint(from.y, to.y)),
  };
  let steps = [...graph.steps, inserted];
  let links = graph.links.filter(l => l !== link).concat({ ...link, to: inserted.key }, plainLink(inserted.key, linkTo));

  const shape = kind === 'ROUTER' ? routerShape(inserted) : undefined;
  if (shape?.slots === 'fixed') {
    const sink: DesignStep = { key: nextKey(), kind: 'SINK', ...branchEndPosition(steps, inserted) };
    steps = [...steps, sink];
    links = [...links, { ...plainLink(inserted.key, sink.key), rule: shape.branch }];
  }

  return accepted({ ...graph, steps, links });
}

/** Adds a Branch, ending in a new Sink, to a List Router. */
export function addBranch(graph: FlowGraph, routerKey: string): EditResult {
  const router = graph.steps.find(s => s.key === routerKey);
  if (router?.kind !== 'ROUTER') {
    return rejected('Only a Router has Branches.');
  }
  const shape = routerShape(router);
  if (shape.slots === 'fixed') {
    return rejected(`An ${routerKind(router)} Router has a fixed set of Branches.`);
  }

  const sink: DesignStep = { key: nextKey(), kind: 'SINK', ...branchEndPosition(graph.steps, router) };
  const branch = plainLink(router.key, sink.key);
  if (shape.hasDefault) {
    branch.rule = unusedBranchName(graph, router.key);
  }
  return accepted({ ...graph, steps: [...graph.steps, sink], links: [...graph.links, branch] });
}

function unusedBranchName(graph: FlowGraph, routerKey: string): string {
  const used = new Set(graph.links.filter(l => l.from === routerKey).map(l => l.rule));
  let n = used.size;
  while (used.has(`branch${n}`)) {
    n++;
  }
  return `branch${n}`;
}

/** Deletes a Step and whatever the tree requires along with it, so the Flow keeps a valid shape. */
export function deleteStep(graph: FlowGraph, key: string): EditResult {
  const target = graph.steps.find(s => s.key === key);
  if (!target) {
    return rejected('There is no such Step.');
  }

  const inbound = graph.links.find(l => l.to === key);
  const outbound = graph.links.filter(l => l.from === key);

  if (target.kind === 'ACTION' && inbound && outbound.length === 1) {
    const links = graph.links.filter(l => l !== inbound && l !== outbound[0]).concat({ ...inbound, to: outbound[0].to });
    return accepted({ ...graph, steps: graph.steps.filter(s => s !== target), links });
  }

  if (target.kind === 'SOURCE') {
    return rejected("The Source can't be deleted: every Flow starts with one.");
  }

  if (target.kind === 'SINK') {
    let branchStart = key;
    let upstream = inbound;
    while (upstream && graph.steps.find(s => s.key === upstream!.from)?.kind === 'ACTION') {
      branchStart = upstream.from;
      upstream = graph.links.find(l => l.to === branchStart);
    }
    const result = deleteBranch(graph, branchStart);
    return result.outcome === 'accepted'
      ? result
      : rejected(`This Sink can't be deleted: every Branch ends in a Sink. ${result.reason}`);
  }

  if (target.kind === 'ROUTER' && inbound) {
    const kept = defaultBranch(graph, target) ?? outbound[0];
    const removed = new Set([key, ...outbound.filter(l => l !== kept).flatMap(l => downstreamKeys(graph, l.to))]);
    const links = graph.links
      .filter(l => l !== inbound && l !== kept && !removed.has(l.from) && !removed.has(l.to))
      .concat({ ...inbound, to: kept.to });
    return accepted({ ...graph, steps: graph.steps.filter(s => !removed.has(s.key)), links });
  }

  return rejected('This Step cannot be deleted.');
}

/** Deletes the Branch of a List Router that starts with the Link to `linkTo`, with all its Steps. */
export function deleteBranch(graph: FlowGraph, linkTo: string): EditResult {
  const link = graph.links.find(l => l.to === linkTo);
  const router = graph.steps.find(s => s.key === link?.from);
  if (!link || router?.kind !== 'ROUTER' || routerShape(router).slots === 'fixed') {
    return rejected('Only a Branch of a List Router can be deleted.');
  }
  if (link === defaultBranch(graph, router)) {
    return rejected("The Default branch can't be deleted.");
  }
  if (graph.links.filter(l => l.from === router.key).length === 1) {
    return rejected('A Router needs at least one Branch.');
  }

  const removed = new Set(downstreamKeys(graph, linkTo));
  return accepted({
    ...graph,
    steps: graph.steps.filter(s => !removed.has(s.key)),
    links: graph.links.filter(l => l !== link && !removed.has(l.from)),
  });
}

/** The Branch a Router uses when no other applies: its outbound Link without a name. Recipient list Routers have none. */
export function defaultBranch(graph: FlowGraph, router: DesignStep): DesignLink | undefined {
  const shape = routerShape(router);
  if (shape.slots === 'list' && !shape.hasDefault) {
    return undefined;
  }
  return graph.links.find(l => l.from === router.key && !l.rule);
}

/** The Step itself and every Step downstream of it. */
function downstreamKeys(graph: FlowGraph, key: string): string[] {
  return [key, ...graph.links.filter(l => l.from === key).flatMap(l => downstreamKeys(graph, l.to))];
}

/** Swaps a Step's component. A Router can only become a kind of Router with the same Branches. */
export function changeComponent(graph: FlowGraph, key: string, componentType: string): EditResult {
  const target = graph.steps.find(s => s.key === key);
  if (!target) {
    return rejected('There is no such Step.');
  }
  if (target.kind === 'ROUTER' && JSON.stringify(routerShape(target)) !== JSON.stringify(routerShape({ componentType }))) {
    return rejected(`A ${componentType} Router has different Branches; delete this Router and insert a new one instead.`);
  }

  return accepted(replaceStep(graph, { ...target, componentType, uri: target.componentType ? target.uri : undefined }));
}

function replaceStep(graph: FlowGraph, step: DesignStep): FlowGraph {
  return { ...graph, steps: graph.steps.map(s => (s.key === step.key ? step : s)) };
}

export type StepSettings = Pick<DesignStep, 'uri' | 'options' | 'connectionId' | 'messageId' | 'routeId' | 'responseId'>;
export type LinkSettings = Pick<DesignLink, 'rule' | 'language' | 'expression' | 'pattern' | 'transport'>;

export function updateStep(graph: FlowGraph, key: string, settings: Partial<StepSettings>): EditResult {
  const target = graph.steps.find(s => s.key === key);
  return target ? accepted(replaceStep(graph, { ...target, ...settings })) : rejected('There is no such Step.');
}

export function moveStep(graph: FlowGraph, key: string, x: number, y: number): EditResult {
  const target = graph.steps.find(s => s.key === key);
  return target ? accepted(replaceStep(graph, { ...target, x, y })) : rejected('There is no such Step.');
}

/** Edits the Link to `linkTo`. Branch names are fixed on Fixed-slot Routers, and the Default branch has none. */
export function updateLink(graph: FlowGraph, linkTo: string, settings: Partial<LinkSettings>): EditResult {
  const link = graph.links.find(l => l.to === linkTo);
  if (!link) {
    return rejected('There is no such Link.');
  }

  const router = graph.steps.find(s => s.key === link.from && s.kind === 'ROUTER');
  if (settings.rule !== undefined && settings.rule !== link.rule) {
    if (!router || routerShape(router).slots === 'fixed') {
      return rejected(router ? `The Branches of an ${routerKind(router)} Router can't be renamed.` : 'Only a Branch has a name.');
    }
    if (link === defaultBranch(graph, router)) {
      return rejected("The Default branch can't be given a name.");
    }
  }

  const updated = { ...link, ...settings };
  return accepted({ ...graph, links: graph.links.map(l => (l === link ? updated : l)) });
}

/** Something that keeps a Flow a Draft, attached to a Step or to the Link that leads to `linkTo`. */
export interface Problem {
  stepKey?: string;
  linkTo?: string;
  message: string;
}

/** Router kinds whose named Branches decide on a Condition. */
const CONDITIONAL_ROUTERS = ['content', 'if', 'split', 'splitwithnamespace', 'splitandaggregate', 'splitandaggregatewithnamespace', 'loop', 'dowhile'];

/** Whether the Link to `linkTo` is a named Branch of a Router that decides on a Condition. */
export function takesCondition(graph: FlowGraph, linkTo: string): boolean {
  const link = graph.links.find(l => l.to === linkTo);
  const router = graph.steps.find(s => s.key === link?.from && s.kind === 'ROUTER');
  return !!link?.rule && !!router && CONDITIONAL_ROUTERS.includes(routerKind(router));
}

export function problems(graph: FlowGraph): Problem[] {
  const stepProblems: Problem[] = graph.steps
    .filter(s => !(s.componentType || s.uri))
    .map(s => ({ stepKey: s.key, message: 'Choose a component for this Step.' }));

  const linkProblems: Problem[] = graph.links
    .filter(l => !l.expression && takesCondition(graph, l.to))
    .map(l => ({ linkTo: l.to, message: `Give the ${l.rule} Branch a Condition.` }));

  return [...stepProblems, ...linkProblems];
}

/** A Flow is a Draft while anything in it is incomplete. A Draft can be saved but not started. */
export function isDraft(graph: FlowGraph): boolean {
  return problems(graph).length > 0;
}

/** The Steps to create or update, keyed so their new ids can be matched back for `linksToSave`. */
export function stepsToSave(graph: FlowGraph, flowId: number): { key: string; step: IStep }[] {
  return graph.steps.map(s => ({
    key: s.key,
    step: {
      id: s.id,
      stepType: s.kind as IStep['stepType'],
      componentType: s.componentType,
      uri: s.uri,
      options: s.kind === 'ROUTER' && routerKind(s).startsWith('split') ? withoutCondition(s.options) : s.options,
      connectionId: s.connectionId,
      messageId: s.messageId,
      routeId: s.routeId,
      responseId: s.responseId,
      coordinateX: s.x,
      coordinateY: s.y,
      flowId,
    },
  }));
}

/** A split Router's Condition lives on its split Branch, not in its options. */
function withoutCondition(options: string | undefined): string | undefined {
  return options
    ?.split('&')
    .filter(option => !/^(language|expression)=/.test(option))
    .join('&');
}

/**
 * Both ends of every Link, named {flowId}-{downstreamStepId}. Every Step has at most one inbound Link,
 * so the name is unique. The Branch settings go on the outbound end, which is where the runtime reads them.
 */
export function linksToSave(graph: FlowGraph, flowId: number, stepIds: Map<string, number>): ILink[] {
  return graph.links.flatMap(link => {
    const name = `${flowId}-${stepIds.get(link.to)}`;
    const branchSettings = Object.fromEntries(
      (['pattern', 'rule', 'language', 'expression'] as const).filter(field => link[field]).map(field => [field, link[field]]),
    );
    return [
      { name, bound: 'out', stepId: stepIds.get(link.from), transport: link.transport, ...branchSettings },
      { name, bound: 'in', stepId: stepIds.get(link.to), transport: link.transport },
    ];
  });
}

const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 140;

/** Lays the tree out left to right: each Step one column right of its upstream Step, Branches stacked below each other. */
export function autoArrange(graph: FlowGraph): FlowGraph {
  const positions = new Map<string, { x: number; y: number }>();
  let nextRow = 0;

  const place = (key: string, column: number): number => {
    const children = graph.links.filter(l => l.from === key).map(l => l.to);
    const rows = children.length ? children.map(child => place(child, column + 1)) : [nextRow++];
    const row = (Math.min(...rows) + Math.max(...rows)) / 2;
    positions.set(key, { x: column * COLUMN_WIDTH, y: row * ROW_HEIGHT });
    return row;
  };

  graph.steps.filter(s => !graph.links.some(l => l.to === s.key)).forEach(root => place(root.key, 0));

  return { ...graph, steps: graph.steps.map(s => ({ ...s, ...positions.get(s.key) })) };
}

const midpoint = (a: number | undefined, b: number | undefined): number | undefined =>
  a === undefined || b === undefined ? undefined : (a + b) / 2;

/** Where a new Branch's Sink goes: one column right of its Router, below the Steps already there. */
function branchEndPosition(steps: DesignStep[], router: DesignStep): Pick<DesignStep, 'x' | 'y'> {
  return router.x === undefined || router.y === undefined ? {} : freePosition(steps, router.x + COLUMN_WIDTH, router.y + ROW_HEIGHT);
}

/** The room a Step takes on the canvas, with some space around it. */
const STEP_WIDTH = 200;
const STEP_HEIGHT = 100;

/** The first position at or below (x, y) where a Step overlaps no other Step; nothing when (x, y) isn't known. */
function freePosition(steps: DesignStep[], x: number | undefined, y: number | undefined): Pick<DesignStep, 'x' | 'y'> {
  if (x === undefined || y === undefined) {
    return {};
  }
  const overlaps = (atY: number): boolean =>
    steps.some(s => s.x !== undefined && s.y !== undefined && Math.abs(s.x - x) < STEP_WIDTH && Math.abs(s.y - atY) < STEP_HEIGHT);
  let freeY = y;
  while (overlaps(freeY)) {
    freeY += ROW_HEIGHT;
  }
  return { x, y: freeY };
}
