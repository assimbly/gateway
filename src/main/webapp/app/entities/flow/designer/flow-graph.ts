import { IFlow } from 'app/shared/model/flow.model';
import { ILink } from 'app/shared/model/link.model';
import { IStep } from 'app/shared/model/step.model';
import { PathRule, missingPathParts } from 'app/shared/camel/endpoint';
import { responseSettings } from './response';

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

/** What a Handler Flow knows of the Operation it handles: its Source is that Operation (ADR 0003). */
export interface HandlerInfo {
  method: string;
  fullPath: string;
  /** The Operation's Declared response statuses, such as '200', '404' or 'default'. */
  declaredStatuses: string[];
}

export interface FlowGraph {
  flowId?: number;
  steps: DesignStep[];
  links: DesignLink[];
  errorStep?: IStep;
  /** Set when the Flow is a Handler Flow. */
  handler?: HandlerInfo;
  /** The saved Links did not form a complete Flow, so they were rebuilt as a chain in Step order. */
  repaired: boolean;
  /** Set when the Flow uses Step types the designer can't edit; the canvas then only shows it. */
  readOnlyReason?: string;
}

const KINDS: StepKind[] = ['SOURCE', 'ACTION', 'ROUTER', 'SINK'];

/** Script and Route Flows are edited with forms; every other kind of Flow is designed on the canvas. */
export function opensOnCanvas(flowType: string | undefined): boolean {
  return flowType !== 'script' && flowType !== 'route';
}

/**
 * What a kind of Router does with its Branches.
 * A Fixed-slot Router has one named Branch plus the Default branch; a List Router has any number of equal Branches.
 * `takesCondition`: its named Branches decide on a Condition. `returnsToRouter`: its named Branch hands its result
 * back to the Router, which then carries on with the Default branch.
 */
export type RouterShape = ({ slots: 'fixed'; branch: string } | { slots: 'list'; hasDefault: boolean }) & {
  takesCondition: boolean;
  returnsToRouter: boolean;
};

const fixed = (branch: string, takesCondition: boolean, returnsToRouter: boolean): RouterShape => ({
  slots: 'fixed',
  branch,
  takesCondition,
  returnsToRouter,
});
const list = (hasDefault: boolean, takesCondition: boolean): RouterShape => ({ slots: 'list', hasDefault, takesCondition, returnsToRouter: false });

const ROUTER_SHAPES: Record<string, RouterShape> = {
  if: fixed('if', true, false),
  split: fixed('split', true, true),
  splitwithnamespace: fixed('split', true, true),
  splitandaggregate: fixed('split', true, true),
  splitandaggregatewithnamespace: fixed('split', true, true),
  enrich: fixed('enrich', false, true),
  wiretap: fixed('wiretap', false, false),
  loop: fixed('loop', true, true),
  dowhile: fixed('dowhile', true, true),
  content: list(true, true),
  dynamic: list(true, false),
  recipient: list(false, false),
  link: list(false, false),
};

/** The kinds of Router that can be inserted on the canvas. */
export const ROUTER_KINDS = Object.keys(ROUTER_SHAPES);

/** The kind of Router a Step is, such as 'if' or 'content'. Imported Steps keep it in the uri. */
export function routerKind(step: Pick<DesignStep, 'componentType' | 'uri'>): string {
  return (step.componentType || step.uri || '').toLowerCase().replace(/:.*$/, '');
}

/** Router kinds the shape table doesn't know are treated as List Routers without a Default branch. */
export function routerShape(step: Pick<DesignStep, 'componentType' | 'uri'>): RouterShape {
  return ROUTER_SHAPES[routerKind(step)] ?? list(false, false);
}

/** Loads a Flow; with `handler`, as the Handler Flow of that Operation. */
export function loadFlowGraph(flow: IFlow, handler?: HandlerInfo): FlowGraph {
  const flowSteps = flow.steps ?? [];
  const savedSteps: DesignStep[] = flowSteps.filter(s => KINDS.includes(s.stepType as StepKind)).map(toDesignStep);
  const errorStep = flowSteps.find(s => s.stepType === 'ERROR');

  const readOnlyReason = unsupportedReason(flowSteps);
  if (readOnlyReason) {
    const graph = { flowId: flow.id, steps: savedSteps, links: linksFromSavedLinks(flowSteps, savedSteps), errorStep, handler, repaired: false, readOnlyReason };
    return arrangedIfUnplaced(graph);
  }

  const placed = withPlaceholders(savedSteps);
  const saved = { flowId: flow.id, steps: placed, links: linksFromSavedLinks(flowSteps, placed), errorStep, handler, repaired: false };
  if (isValidTree(saved)) {
    return arrangedIfUnplaced(saved);
  }

  const repaired = withFixedSlotBranches({ ...saved, links: chainInStepOrder(placed), repaired: savedSteps.length > 0 });
  return arrangedIfUnplaced(repaired);
}

/**
 * Whether the Links form a tree from the Source in which every Step has the Links its kind needs (ADR 0001).
 * A Source or Action may still be an open end, without its outbound Link.
 */
function isValidTree(graph: FlowGraph): boolean {
  const inbound = (key: string): number => graph.links.filter(l => l.to === key).length;
  const outbound = (step: DesignStep): DesignLink[] => graph.links.filter(l => l.from === step.key);

  const linksFitKinds = graph.steps.every(step => {
    const out = outbound(step);
    switch (step.kind) {
      case 'SOURCE':
        return inbound(step.key) === 0 && out.length <= 1;
      case 'ACTION':
        return inbound(step.key) === 1 && out.length <= 1;
      case 'SINK':
        return inbound(step.key) === 1 && out.length === 0;
      case 'ROUTER': {
        const shape = routerShape(step);
        const fitsShape = shape.slots === 'fixed' ? out.length === 2 && out.some(l => l.rule === shape.branch) : out.length > 0;
        return inbound(step.key) === 1 && fitsShape;
      }
    }
  });

  const sources = graph.steps.filter(s => s.kind === 'SOURCE');
  return linksFitKinds && sources.length === 1 && downstreamKeys(graph, sources[0].key).length === graph.steps.length;
}

/** After a repair, every Fixed-slot Router gets its named Branch back, ending in a new Sink. */
function withFixedSlotBranches(graph: FlowGraph): FlowGraph {
  return graph.steps.reduce((result, step) => {
    const shape = routerShape(step);
    if (step.kind !== 'ROUTER' || shape.slots !== 'fixed' || result.links.some(l => l.from === step.key && l.rule === shape.branch)) {
      return result;
    }
    const sink: DesignStep = { key: nextKey(), kind: 'SINK' };
    return { ...result, steps: [...result.steps, sink], links: [...result.links, { ...plainLink(step.key, sink.key), rule: shape.branch }] };
  }, graph);
}

/** Why the designer can only show this Flow, if it can't edit it. */
function unsupportedReason(flowSteps: IStep[]): string | undefined {
  const unsupportedTypes = [...new Set(flowSteps.map(s => s.stepType as string).filter(t => !KINDS.includes(t as StepKind) && t !== 'ERROR'))];
  if (unsupportedTypes.length) {
    return `This Flow uses Step types the designer can't edit: ${unsupportedTypes.join(', ')}.`;
  }
  if (hasAmbiguousBranches(flowSteps)) {
    return "This Flow was imported before Branches got their own Link names, so it is not known which Branch settings belong to which Step. Import its DIL again to edit it here.";
  }
  return undefined;
}

/** Older imports gave all Branches of a Router one Link name; that only matters when the Branches differ. */
function hasAmbiguousBranches(flowSteps: IStep[]): boolean {
  const branchSettings = new Map<string, Set<string>>();
  for (const link of flowSteps.flatMap(s => s.links ?? []).filter(l => l.bound === 'out')) {
    const settings = branchSettings.get(link.name!) ?? new Set<string>();
    settings.add(JSON.stringify([link.rule || '', link.language || '', link.expression || '', link.pattern || '', link.transport || '']));
    branchSettings.set(link.name!, settings);
  }
  return [...branchSettings.values()].some(settings => settings.size > 1);
}

function arrangedIfUnplaced(graph: FlowGraph): FlowGraph {
  return graph.steps.every(s => s.x !== undefined && s.y !== undefined) ? graph : autoArrange(graph);
}

/** A Flow always has a Source; a missing one is added unconfigured. The user adds the Steps after it. */
function withPlaceholders(steps: DesignStep[]): DesignStep[] {
  return steps.some(s => s.kind === 'SOURCE') ? steps : [{ key: nextKey(), kind: 'SOURCE' }, ...steps];
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
 * The new Step takes the place of the downstream Step, which moves one column to the right with everything after it.
 */
export function insertStep(graph: FlowGraph, linkTo: string, kind: 'ACTION' | 'ROUTER', componentType: string): EditResult {
  const link = graph.links.find(l => l.to === linkTo);
  if (!link) {
    return rejected('There is no Link to insert into.');
  }

  const to = graph.steps.find(s => s.key === linkTo)!;
  const inserted: DesignStep = { key: nextKey(), kind, componentType, x: to.x, y: to.y };
  const shifted = shiftRight(graph, linkTo);
  let steps = [...shifted.steps, inserted];
  let links = graph.links.filter(l => l !== link).concat({ ...link, to: inserted.key }, plainLink(inserted.key, linkTo));

  const shape = kind === 'ROUTER' ? routerShape(inserted) : undefined;
  if (shape?.slots === 'fixed') {
    const sink: DesignStep = { key: nextKey(), kind: 'SINK', ...branchEndPosition(steps, inserted) };
    steps = [...steps, sink];
    links = [...links, { ...plainLink(inserted.key, sink.key), rule: shape.branch }];
  }

  return accepted({ ...graph, steps, links });
}

/** Moves a Step and every Step downstream of it one column to the right. */
function shiftRight(graph: FlowGraph, key: string): FlowGraph {
  const moved = new Set(downstreamKeys(graph, key));
  return {
    ...graph,
    steps: graph.steps.map(s => (moved.has(s.key) && s.x !== undefined ? { ...s, x: s.x + COLUMN_WIDTH } : s)),
  };
}

/** Source and Action Steps that have no next Step yet. The Flow stays a Draft until each of them leads to a Sink. */
export function openEnds(graph: FlowGraph): DesignStep[] {
  if (graph.readOnlyReason) {
    return [];
  }
  return graph.steps.filter(s => (s.kind === 'SOURCE' || s.kind === 'ACTION') && !graph.links.some(l => l.from === s.key));
}

/**
 * Adds the next Step after an open end. A new Router gets the Branches its kind needs, each ending in a new Sink:
 * the Default branch (when it has one), its named Branch (on a Fixed-slot Router), or a first Branch (on a Recipient list Router).
 */
export function appendStep(graph: FlowGraph, afterKey: string, kind: 'ACTION' | 'ROUTER' | 'SINK', componentType: string): EditResult {
  const after = graph.steps.find(s => s.key === afterKey);
  if (!after || !openEnds(graph).includes(after)) {
    return rejected('A Step can only be added after a Source or Action that has no next Step yet.');
  }

  if (componentType === RESPONSE_COMPONENT) {
    if (!graph.handler) {
      return rejected('Only a Handler Flow ends a request with a Response.');
    }
    if (kind !== 'SINK' || !endsRequest(graph, afterKey)) {
      return rejected('This Branch returns to its Router, so it can\'t answer the request: end it with an ordinary Sink.');
    }
    const response: DesignStep = { key: nextKey(), kind: 'SINK', componentType: RESPONSE_STEP_COMPONENT, options: 'status=200', ...nextColumnPosition(graph.steps, after) };
    return accepted({ ...graph, steps: [...graph.steps, response], links: [...graph.links, plainLink(after.key, response.key)] });
  }

  const appended: DesignStep = { key: nextKey(), kind, componentType, ...nextColumnPosition(graph.steps, after) };
  let steps = [...graph.steps, appended];
  let links = [...graph.links, plainLink(after.key, appended.key)];

  if (kind === 'ROUTER') {
    const shape = routerShape(appended);
    const branchRules = shape.slots === 'fixed' ? [undefined, shape.branch] : [undefined];
    for (const rule of branchRules) {
      const sink: DesignStep = { key: nextKey(), kind: 'SINK', ...nextColumnPosition(steps, appended) };
      steps = [...steps, sink];
      links = [...links, { ...plainLink(appended.key, sink.key), rule }];
    }
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

  // The last Step after a Source or Action goes on its own, which leaves its upstream Step as an open end.
  const upstream = inbound && graph.steps.find(s => s.key === inbound.from);
  if ((target.kind === 'SINK' || target.kind === 'ACTION') && outbound.length === 0 && upstream?.kind !== 'ROUTER') {
    return accepted({ ...graph, steps: graph.steps.filter(s => s !== target), links: graph.links.filter(l => l !== inbound) });
  }

  // The only Step of a Branch goes together with the Branch.
  if (target.kind === 'SINK' || (target.kind === 'ACTION' && outbound.length === 0)) {
    const result = deleteBranch(graph, key);
    return result.outcome === 'accepted' ? result : rejected(`This Step can't be deleted: it is all that is left of its Branch. ${result.reason}`);
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

/** Whether the Step can be deleted, so the editor only offers to delete it then. */
export function canDeleteStep(graph: FlowGraph, key: string): boolean {
  return deleteStep(graph, key).outcome === 'accepted';
}

/** Deletes the Branch of a List Router that starts with the Link to `linkTo`, with all its Steps. */
export function deleteBranch(graph: FlowGraph, linkTo: string): EditResult {
  const refusal = deleteBranchRefusal(graph, linkTo);
  if (refusal) {
    return rejected(refusal);
  }

  const removed = new Set(downstreamKeys(graph, linkTo));
  return accepted({
    ...graph,
    steps: graph.steps.filter(s => !removed.has(s.key)),
    links: graph.links.filter(l => l.to !== linkTo && !removed.has(l.from)),
  });
}

/** Whether the Branch leading to `linkTo` can be deleted. */
export function canDeleteBranch(graph: FlowGraph, linkTo: string): boolean {
  return !deleteBranchRefusal(graph, linkTo);
}

function deleteBranchRefusal(graph: FlowGraph, linkTo: string): string | undefined {
  const link = graph.links.find(l => l.to === linkTo);
  const router = link && routerOf(graph, link);
  if (!link || !router || routerShape(router).slots === 'fixed') {
    return 'Only a Branch of a List Router can be deleted.';
  }
  if (link === defaultBranch(graph, router)) {
    return "The Default branch can't be deleted.";
  }
  if (graph.links.filter(l => l.from === router.key).length === 1) {
    return 'A Router needs at least one Branch.';
  }
  return undefined;
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
  if (isLockedSource(graph, key)) {
    return rejected(LOCKED_SOURCE);
  }
  if (target.kind === 'ROUTER' && !sameBranches(routerShape(target), routerShape({ componentType }))) {
    return rejected(`A ${componentType} Router has different Branches; delete this Router and insert a new one instead.`);
  }

  return accepted(replaceStep(graph, { ...target, componentType, uri: target.componentType ? target.uri : undefined }));
}

/** Whether two kinds of Router have the same Branches, so one can replace the other in place. */
export function sameBranches(a: RouterShape, b: RouterShape): boolean {
  return a.slots === 'fixed' && b.slots === 'fixed' ? a.branch === b.branch : a.slots === 'list' && b.slots === 'list' && a.hasDefault === b.hasDefault;
}

function replaceStep(graph: FlowGraph, step: DesignStep): FlowGraph {
  return { ...graph, steps: graph.steps.map(s => (s.key === step.key ? step : s)) };
}

export type StepSettings = Pick<DesignStep, 'uri' | 'options' | 'connectionId' | 'messageId' | 'routeId' | 'responseId'>;
export type LinkSettings = Pick<DesignLink, 'rule' | 'language' | 'expression' | 'pattern' | 'transport'>;

export function updateStep(graph: FlowGraph, key: string, settings: Partial<StepSettings>): EditResult {
  const target = graph.steps.find(s => s.key === key);
  if (target && isLockedSource(graph, key)) {
    return rejected(LOCKED_SOURCE);
  }
  return target ? accepted(replaceStep(graph, { ...target, ...settings })) : rejected('There is no such Step.');
}

/** The picker's entry for a Response; it is stored as a setmessage Sink (see response.ts). */
export const RESPONSE_COMPONENT = 'response';
export const RESPONSE_STEP_COMPONENT = 'setmessage';

const LOCKED_SOURCE = "The Source of a Handler Flow is its Operation: change the method or path on the Operation's API page.";

/** A Handler Flow's Source is its Operation, edited from the API; on the canvas it can't be swapped or edited. */
export function isLockedSource(graph: FlowGraph, key: string): boolean {
  return !!graph.handler && graph.steps.some(s => s.key === key && s.kind === 'SOURCE');
}

/**
 * Whether a Step is on a part of the Flow that ends the request: every part does, except a Branch that returns to its
 * Router (the named Branch of enrich, split, loop and dowhile Routers) and the wiretap Branch.
 */
export function endsRequest(graph: FlowGraph, key: string): boolean {
  let link = graph.links.find(l => l.to === key);
  while (link) {
    if (returnsFromBranch(graph, link)) {
      return false;
    }
    const from = link.from;
    link = graph.links.find(l => l.to === from);
  }
  return true;
}

function returnsFromBranch(graph: FlowGraph, link: DesignLink): boolean {
  const router = routerOf(graph, link);
  if (!router || !link.rule) {
    return false;
  }
  const shape = routerShape(router);
  return shape.slots === 'fixed' && link.rule === shape.branch && (shape.returnsToRouter || routerKind(router) === 'wiretap');
}

/** A Response: in a Handler Flow, a setmessage Sink without a Message of its own, on a part that ends the request. */
export function isResponse(graph: FlowGraph, step: DesignStep): boolean {
  return (
    !!graph.handler &&
    step.kind === 'SINK' &&
    step.componentType?.toLowerCase() === RESPONSE_STEP_COMPONENT &&
    !step.messageId &&
    endsRequest(graph, step.key)
  );
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

  const rule = 'rule' in settings ? settings.rule || undefined : link.rule;
  if (rule !== link.rule) {
    const refusal = renameRefusal(graph, link, rule);
    if (refusal) {
      return rejected(refusal);
    }
  }

  const updated = { ...link, ...settings, rule };
  return accepted({ ...graph, links: graph.links.map(l => (l === link ? updated : l)) });
}

/** Whether the Branch leading to `linkTo` can get another name. */
export function canRenameBranch(graph: FlowGraph, linkTo: string): boolean {
  const link = graph.links.find(l => l.to === linkTo);
  return !!link && !renameRefusal(graph, link, `${link.rule ?? ''}-renamed`);
}

function renameRefusal(graph: FlowGraph, link: DesignLink, rule: string | undefined): string | undefined {
  const router = routerOf(graph, link);
  if (!router) {
    return 'Only a Branch has a name.';
  }
  const shape = routerShape(router);
  if (shape.slots === 'fixed') {
    return `The Branches of an ${routerKind(router)} Router can't be renamed.`;
  }
  if (link === defaultBranch(graph, router)) {
    return "The Default branch can't be given a name.";
  }
  if (!rule && shape.hasDefault) {
    return 'This Branch needs a name: only the Default branch has none.';
  }
  if (rule && graph.links.some(l => l !== link && l.from === router.key && l.rule === rule)) {
    return `This Router already has a Branch named ${rule}.`;
  }
  return undefined;
}

/** The Router a Link leaves from, if it is a Branch. */
export function routerOf(graph: FlowGraph, link: DesignLink): DesignStep | undefined {
  return graph.steps.find(s => s.key === link.from && s.kind === 'ROUTER');
}

/** Something that keeps a Flow a Draft, attached to a Step or to the Link that leads to `linkTo`. */
export interface Problem {
  stepKey?: string;
  linkTo?: string;
  message: string;
}

/** Whether the Link to `linkTo` is a named Branch of a Router that decides on a Condition. */
export function takesCondition(graph: FlowGraph, linkTo: string): boolean {
  const link = graph.links.find(l => l.to === linkTo);
  const router = link && routerOf(graph, link);
  return !!link?.rule && !!router && routerShape(router).takesCondition;
}

/** The path syntax of a Component, when its schema has been read; without it a Step's path isn't checked. */
export type PathRules = (componentType: string) => PathRule | undefined;

export function problems(graph: FlowGraph, pathRules?: PathRules): Problem[] {
  if (graph.readOnlyReason) {
    return [];
  }
  const stepProblems: Problem[] = graph.steps
    .filter(s => !(s.componentType || s.uri))
    .map(s => ({ stepKey: s.key, message: 'Choose a component for this Step.' }));

  // The Operation Source of a Handler Flow has its method and path as options, written from the Operation.
  const pathProblems: Problem[] = graph.steps.flatMap(s => {
    const rule = s.componentType && !isLockedSource(graph, s.key) ? pathRules?.(s.componentType) : undefined;
    const missing = rule ? missingPathParts(rule, s.uri) : [];
    return missing.length ? [{ stepKey: s.key, message: `Fill in the ${missing.join(' and ')} in the path.` }] : [];
  });

  const openEndProblems: Problem[] = openEnds(graph).map(s => ({ stepKey: s.key, message: 'Add the next Step: the Flow ends in a Sink.' }));

  const linkProblems: Problem[] = graph.links
    .filter(l => !l.expression && takesCondition(graph, l.to))
    .map(l => ({ linkTo: l.to, message: `Give the ${l.rule} Branch a Condition.` }));

  const responseProblems: Problem[] = graph.handler
    ? graph.steps
        .filter(s => s.kind === 'SINK' && (s.componentType || s.uri) && endsRequest(graph, s.key) && !isResponse(graph, s))
        .map(s => ({ stepKey: s.key, message: 'This Branch ends the request: end it with a Response, so the caller gets an answer.' }))
    : [];

  const statusProblems: Problem[] = graph.steps
    .filter(s => isResponse(graph, s) && !isHttpStatus(responseSettings(s).status))
    .map(s => ({ stepKey: s.key, message: 'Give the Response a status from 100 to 599.' }));

  return [...stepProblems, ...pathProblems, ...openEndProblems, ...linkProblems, ...responseProblems, ...statusProblems];
}

function isHttpStatus(status: string): boolean {
  return /^[1-5]\d\d$/.test(status);
}

/**
 * What doesn't keep a Flow from running but may not be meant: a Response whose status isn't one of the Operation's
 * Declared responses, while it declares any (a declared `default` covers every status).
 */
export function warnings(graph: FlowGraph): Problem[] {
  const declared = graph.handler?.declaredStatuses ?? [];
  if (graph.readOnlyReason || !declared.length || declared.includes('default')) {
    return [];
  }
  return graph.steps
    .filter(s => isResponse(graph, s))
    .map(s => ({ step: s, status: responseSettings(s).status }))
    .filter(({ status }) => isHttpStatus(status) && !declared.includes(status))
    .map(({ step, status }) => ({
      stepKey: step.key,
      message: `${status} isn't a Declared response of ${graph.handler!.method} ${graph.handler!.fullPath} (${declared.join(', ')}).`,
    }));
}

/** A Flow is a Draft while anything in it is incomplete. A Draft can be saved but not started. */
export function isDraft(graph: FlowGraph, pathRules?: PathRules): boolean {
  return problems(graph, pathRules).length > 0;
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
      options: s.kind === 'ROUTER' && isSplitRouter(s) ? withoutCondition(s.options) : s.options,
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

function isSplitRouter(step: DesignStep): boolean {
  const shape = routerShape(step);
  return shape.slots === 'fixed' && shape.branch === 'split';
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

// Steps are drawn as 96px squares (flow-canvas.component.scss); the rest is room for the Links and their labels.
const COLUMN_WIDTH = 200;
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

/** Where the next Step after `step` goes: one column to its right, below any Steps already there. */
function nextColumnPosition(steps: DesignStep[], step: DesignStep): Pick<DesignStep, 'x' | 'y'> {
  return step.x === undefined || step.y === undefined ? {} : freePosition(steps, step.x + COLUMN_WIDTH, step.y);
}

/** Where a new Branch's Sink goes: one column right of its Router, below the Steps already there. */
function branchEndPosition(steps: DesignStep[], router: DesignStep): Pick<DesignStep, 'x' | 'y'> {
  return router.x === undefined || router.y === undefined ? {} : freePosition(steps, router.x + COLUMN_WIDTH, router.y + ROW_HEIGHT);
}

/** The room a Step takes on the canvas, with some space around it. */
const STEP_WIDTH = 150;
const STEP_HEIGHT = 120;

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
