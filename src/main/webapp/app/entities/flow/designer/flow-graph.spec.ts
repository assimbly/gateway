import { IFlow } from 'app/shared/model/flow.model';
import { ILink } from 'app/shared/model/link.model';
import { IStep } from 'app/shared/model/step.model';

import {
  addBranch,
  autoArrange,
  changeComponent,
  deleteStep,
  EditResult,
  FlowGraph,
  insertStep,
  isDraft,
  linksToSave,
  loadFlowGraph,
  moveStep,
  problems,
  stepsToSave,
  updateLink,
  updateStep,
} from './flow-graph';

const inbound = (name: string, extra: Partial<ILink> = {}): ILink => ({ name, bound: 'in', transport: 'sync', ...extra });
const outbound = (name: string, extra: Partial<ILink> = {}): ILink => ({ name, bound: 'out', transport: 'sync', ...extra });
const step = (id: number, stepType: string, links: ILink[] = [], extra: Partial<IStep> = {}): IStep =>
  ({ id, stepType, componentType: 'log', uri: `step${id}`, links, ...extra }) as IStep;
const flow = (steps: IStep[]): IFlow => ({ id: 1, name: 'flow', steps });

/** Each Link as [from Step id, to Step id], in a stable order. */
const linkIds = (graph: FlowGraph): number[][] =>
  graph.links
    .map(link => [graph.steps.find(s => s.key === link.from)!.id!, graph.steps.find(s => s.key === link.to)!.id!])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

/** Each Link as 'from → to' using Step keys, in a stable order. */
const linkKeys = (graph: FlowGraph): string[] => graph.links.map(l => `${l.from} → ${l.to}`).sort();

const edited = (result: EditResult): FlowGraph => {
  if (result.outcome === 'rejected') {
    throw new Error(`Edit was rejected: ${result.reason}`);
  }
  return result.graph;
};

const sourceToSink = (): FlowGraph =>
  loadFlowGraph(flow([step(10, 'SOURCE', [outbound('1-11')]), step(11, 'SINK', [inbound('1-11', { pattern: 'InOut' })])]));

const contentRouterFlow = (): FlowGraph =>
  loadFlowGraph(
    flow([
      step(10, 'SOURCE', [outbound('1-11')]),
      step(11, 'ROUTER', [inbound('1-11'), outbound('1-12'), outbound('1-13', { rule: 'check', language: 'simple', expression: 'x' })], {
        componentType: '',
        uri: 'content',
      }),
      step(12, 'SINK', [inbound('1-12')]),
      step(13, 'SINK', [inbound('1-13')]),
    ]),
  );

describe('Flow graph', () => {
  describe('loading a Flow', () => {
    it('loads a straight-line Flow as Source → Action → Sink, with the Error Step kept aside', () => {
      const graph = loadFlowGraph(
        flow([
          step(13, 'ERROR'),
          step(10, 'SOURCE', [outbound('1-11')]),
          step(11, 'ACTION', [inbound('1-11'), outbound('1-12')]),
          step(12, 'SINK', [inbound('1-12')]),
        ]),
      );

      expect(graph.steps.map(s => [s.id, s.kind])).toEqual([
        [10, 'SOURCE'],
        [11, 'ACTION'],
        [12, 'SINK'],
      ]);
      expect(linkIds(graph)).toEqual([
        [10, 11],
        [11, 12],
      ]);
      expect(graph.errorStep?.id).toBe(13);
    });

    it('loads a content Router with its Default branch and a Branch with a Condition', () => {
      const graph = loadFlowGraph(
        flow([
          step(10, 'SOURCE', [outbound('1-11')]),
          step(11, 'ROUTER', [inbound('1-11'), outbound('1-12', { pattern: 'InOut' }), outbound('1-13', { rule: 'check', language: 'simple', expression: "${body} contains 'x'" })], { componentType: '', uri: 'content' }),
          step(12, 'SINK', [inbound('1-12')]),
          step(13, 'SINK', [inbound('1-13')]),
        ]),
      );

      expect(linkIds(graph)).toEqual([
        [10, 11],
        [11, 12],
        [11, 13],
      ]);
      const defaultBranch = graph.links.find(l => l.to === 'step-12')!;
      expect(defaultBranch.rule).toBeUndefined();
      expect(defaultBranch.pattern).toBe('InOut');
      const checkBranch = graph.links.find(l => l.to === 'step-13')!;
      expect(checkBranch).toMatchObject({ rule: 'check', language: 'simple', expression: "${body} contains 'x'" });
    });

    it('repairs a Flow with missing Links into a chain in Step order, and says so', () => {
      const graph = loadFlowGraph(flow([step(12, 'SINK'), step(11, 'ACTION', [outbound('1-11')]), step(10, 'SOURCE', [outbound('1-10')])]));

      expect(linkIds(graph)).toEqual([
        [10, 11],
        [11, 12],
      ]);
      expect(graph.repaired).toBe(true);
    });

    it('does not mark a Flow with complete Links as repaired', () => {
      const graph = loadFlowGraph(flow([step(10, 'SOURCE', [outbound('1-11')]), step(11, 'SINK', [inbound('1-11')])]));

      expect(graph.repaired).toBe(false);
    });

    it('opens a Flow with Step types the designer does not support as read-only', () => {
      const graph = loadFlowGraph(flow([step(10, 'FROM', [outbound('1-11')]), step(11, 'TO', [inbound('1-11')])]));

      expect(graph.readOnlyReason).toContain('FROM');
      expect(graph.readOnlyReason).toContain('TO');
    });

    it('opens a Flow with only supported Step types as editable', () => {
      const graph = loadFlowGraph(flow([step(9, 'ERROR'), step(10, 'SOURCE', [outbound('1-11')]), step(11, 'SINK', [inbound('1-11')])]));

      expect(graph.readOnlyReason).toBeUndefined();
    });

    it('opens a Flow without a Source like a new Flow: a placeholder Source linked to a placeholder Sink', () => {
      const graph = loadFlowGraph(flow([step(9, 'ERROR')]));

      expect(graph.steps.map(s => [s.kind, s.id])).toEqual([
        ['SOURCE', undefined],
        ['SINK', undefined],
      ]);
      expect(graph.links).toEqual([expect.objectContaining({ from: graph.steps[0].key, to: graph.steps[1].key })]);
      expect(graph.errorStep?.id).toBe(9);
      expect(graph.repaired).toBe(false);
    });

    it('keeps saved coordinates', () => {
      const graph = loadFlowGraph(
        flow([
          step(10, 'SOURCE', [outbound('1-11')], { coordinateX: 40, coordinateY: 120 }),
          step(11, 'SINK', [inbound('1-11')], { coordinateX: 280, coordinateY: 120 }),
        ]),
      );

      expect(graph.steps.map(s => [s.x, s.y])).toEqual([
        [40, 120],
        [280, 120],
      ]);
    });
  });

  describe('inserting a Step into a Link', () => {
    it('puts a new Action between the two Steps of the Link', () => {
      const graph = edited(insertStep(sourceToSink(), 'step-11', 'ACTION', 'setbody'));

      const action = graph.steps.find(s => s.kind === 'ACTION')!;
      expect(action.componentType).toBe('setbody');
      expect(linkKeys(graph)).toEqual([`${action.key} → step-11`, `step-10 → ${action.key}`]);
    });

    it('keeps the Branch name and Condition on the Router side when inserting into a Branch', () => {
      const graph = edited(insertStep(contentRouterFlow(), 'step-13', 'ACTION', 'setbody'));

      const action = graph.steps.find(s => s.kind === 'ACTION')!;
      expect(graph.links.find(l => l.to === action.key)).toMatchObject({ from: 'step-11', rule: 'check', language: 'simple', expression: 'x' });
      const afterAction = graph.links.find(l => l.to === 'step-13')!;
      expect(afterAction.from).toBe(action.key);
      expect(afterAction.rule).toBeUndefined();
      expect(afterAction.expression).toBeUndefined();
    });

    it('gives a new Fixed-slot Router its Default branch (the existing downstream) and its named Branch ending in a new Sink', () => {
      const graph = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'if'));

      const router = graph.steps.find(s => s.kind === 'ROUTER')!;
      const branches = graph.links.filter(l => l.from === router.key);
      expect(branches).toHaveLength(2);

      const defaultBranch = branches.find(l => !l.rule)!;
      expect(defaultBranch.to).toBe('step-11');

      const ifBranch = branches.find(l => l.rule === 'if')!;
      const newSink = graph.steps.find(s => s.key === ifBranch.to)!;
      expect(newSink.kind).toBe('SINK');
      expect(newSink.id).toBeUndefined();
    });
  });

  describe('adding a Branch', () => {
    it('adds a Branch ending in a new Sink to a List Router', () => {
      const graph = edited(addBranch(contentRouterFlow(), 'step-11'));

      const branches = graph.links.filter(l => l.from === 'step-11');
      expect(branches).toHaveLength(3);
      const newSink = graph.steps.find(s => s.key === branches[2].to)!;
      expect(newSink.kind).toBe('SINK');
    });

    it('names a new Branch of a Router that has a Default branch, so it does not become a second Default branch', () => {
      const graph = edited(addBranch(edited(addBranch(contentRouterFlow(), 'step-11')), 'step-11'));

      const names = graph.links.filter(l => l.from === 'step-11').map(l => l.rule);
      expect(names.filter(name => !name)).toHaveLength(1);
      expect(new Set(names).size).toBe(4);
    });

    it('does not name the Branches of a Recipient list Router', () => {
      const recipient = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'recipient'));
      const router = recipient.steps.find(s => s.kind === 'ROUTER')!;

      const graph = edited(addBranch(recipient, router.key));

      expect(graph.links.filter(l => l.from === router.key).map(l => l.rule)).toEqual([undefined, undefined]);
    });

    it('refuses to add a Branch to a Fixed-slot Router', () => {
      const ifRouter = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'if'));
      const router = ifRouter.steps.find(s => s.kind === 'ROUTER')!;

      const result = addBranch(ifRouter, router.key);

      expect(result).toEqual({ outcome: 'rejected', reason: expect.stringContaining('if') });
    });

    it('refuses to add a Branch to a Step that is not a Router', () => {
      expect(addBranch(sourceToSink(), 'step-10').outcome).toBe('rejected');
    });
  });

  describe('deleting a Step', () => {
    it('reconnects the Steps around a deleted Action, keeping the Branch settings of the upstream Link', () => {
      const withAction = edited(insertStep(contentRouterFlow(), 'step-13', 'ACTION', 'setbody'));
      const action = withAction.steps.find(s => s.kind === 'ACTION')!;

      const graph = edited(deleteStep(withAction, action.key));

      expect(graph.steps.some(s => s.key === action.key)).toBe(false);
      expect(graph.links.find(l => l.to === 'step-13')).toMatchObject({ from: 'step-11', rule: 'check', expression: 'x' });
    });

    it('replaces a deleted Router with its Default branch and removes its other Branches', () => {
      const withAction = edited(insertStep(contentRouterFlow(), 'step-13', 'ACTION', 'setbody'));

      const graph = edited(deleteStep(withAction, 'step-11'));

      expect(graph.steps.map(s => s.key)).toEqual(['step-10', 'step-12']);
      expect(linkKeys(graph)).toEqual(['step-10 → step-12']);
    });

    it('replaces a deleted Recipient list Router with its first Branch', () => {
      const recipient = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'recipient'));
      const router = recipient.steps.find(s => s.kind === 'ROUTER')!;
      const withSecondBranch = edited(addBranch(recipient, router.key));

      const graph = edited(deleteStep(withSecondBranch, router.key));

      expect(graph.steps.map(s => s.key)).toEqual(['step-10', 'step-11']);
      expect(linkKeys(graph)).toEqual(['step-10 → step-11']);
    });

    it('removes the whole Branch when the Sink of a List Router Branch is deleted', () => {
      const withAction = edited(insertStep(contentRouterFlow(), 'step-13', 'ACTION', 'setbody'));

      const graph = edited(deleteStep(withAction, 'step-13'));

      expect(graph.steps.map(s => s.key)).toEqual(['step-10', 'step-11', 'step-12']);
      expect(linkKeys(graph)).toEqual(['step-10 → step-11', 'step-11 → step-12']);
    });

    it('refuses to delete the Sink of a Default branch', () => {
      expect(deleteStep(contentRouterFlow(), 'step-12')).toEqual({ outcome: 'rejected', reason: expect.stringContaining('Sink') });
    });

    it('refuses to delete a Sink that is not at the end of a List Router Branch', () => {
      expect(deleteStep(sourceToSink(), 'step-11').outcome).toBe('rejected');
    });

    it('refuses to delete the Sink of the last Branch of a Recipient list Router', () => {
      const recipient = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'recipient'));

      expect(deleteStep(recipient, 'step-11').outcome).toBe('rejected');
    });

    it('refuses to delete the Source', () => {
      expect(deleteStep(sourceToSink(), 'step-10')).toEqual({ outcome: 'rejected', reason: expect.stringContaining('Source') });
    });
  });

  describe('changing the component of a Step', () => {
    it('changes the component of an Action', () => {
      const withAction = edited(insertStep(sourceToSink(), 'step-11', 'ACTION', 'setbody'));
      const action = withAction.steps.find(s => s.kind === 'ACTION')!;

      const graph = edited(changeComponent(withAction, action.key, 'setheaders'));

      expect(graph.steps.find(s => s.key === action.key)!.componentType).toBe('setheaders');
    });

    it('changes a Router to another kind with the same Branches', () => {
      const graph = edited(changeComponent(contentRouterFlow(), 'step-11', 'dynamic'));

      expect(graph.steps.find(s => s.key === 'step-11')!.componentType).toBe('dynamic');
    });

    it('refuses to change a Router to a kind with different Branches', () => {
      expect(changeComponent(contentRouterFlow(), 'step-11', 'if')).toEqual({
        outcome: 'rejected',
        reason: expect.stringContaining('delete'),
      });
    });
  });

  describe('editing Steps and Links', () => {
    it("edits a Step's settings", () => {
      const graph = edited(updateStep(sourceToSink(), 'step-10', { uri: 'tick', options: 'period=1000' }));

      expect(graph.steps.find(s => s.key === 'step-10')).toMatchObject({ uri: 'tick', options: 'period=1000' });
    });

    it('moves a Step', () => {
      const graph = edited(moveStep(sourceToSink(), 'step-10', 15, 30));

      expect(graph.steps.find(s => s.key === 'step-10')).toMatchObject({ x: 15, y: 30 });
    });

    it("edits a Branch's name, Condition and settings", () => {
      const graph = edited(
        updateLink(contentRouterFlow(), 'step-13', { rule: 'big', language: 'jsonpath', expression: '$.size', pattern: 'InOnly', transport: 'async' }),
      );

      expect(graph.links.find(l => l.to === 'step-13')).toMatchObject({
        rule: 'big',
        language: 'jsonpath',
        expression: '$.size',
        pattern: 'InOnly',
        transport: 'async',
      });
    });

    it('refuses to rename a Branch of a Fixed-slot Router', () => {
      const ifRouter = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'if'));
      const ifBranch = ifRouter.links.find(l => l.rule === 'if')!;

      expect(updateLink(ifRouter, ifBranch.to, { rule: 'other' }).outcome).toBe('rejected');
      expect(edited(updateLink(ifRouter, ifBranch.to, { expression: '${body} == 1' })).links.find(l => l.rule === 'if')!.expression).toBe(
        '${body} == 1',
      );
    });

    it('refuses to give the Default branch a name', () => {
      expect(updateLink(contentRouterFlow(), 'step-12', { rule: 'named' }).outcome).toBe('rejected');
    });
  });

  describe('Draft', () => {
    it('is not a Draft when every Step has a component and every Branch that needs a Condition has one', () => {
      expect(isDraft(contentRouterFlow())).toBe(false);
      expect(problems(contentRouterFlow())).toEqual([]);
    });

    it('is a Draft while a Step has no component', () => {
      const graph = loadFlowGraph(flow([]));

      expect(isDraft(graph)).toBe(true);
      expect(problems(graph).map(p => p.stepKey)).toEqual(graph.steps.map(s => s.key));
    });

    it('is a Draft while a named Branch of a content Router has no Condition', () => {
      const graph = edited(addBranch(contentRouterFlow(), 'step-11'));
      const newBranch = graph.links.find(l => l.rule === 'branch2')!;

      expect(problems(graph)).toContainEqual(expect.objectContaining({ linkTo: newBranch.to }));
    });

    it('is a Draft while the if Branch of an if Router has no Condition', () => {
      const ifRouter = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'if'));
      const ifBranch = ifRouter.links.find(l => l.rule === 'if')!;
      const withSinkComponent = edited(changeComponent(ifRouter, ifBranch.to, 'log'));

      expect(problems(withSinkComponent)).toEqual([expect.objectContaining({ linkTo: ifBranch.to })]);
    });
  });

  describe('saving', () => {
    it('names each Link after the Step it leads to and puts the Branch settings on the outbound end', () => {
      const graph = contentRouterFlow();
      const stepIds = new Map(graph.steps.map(s => [s.key, s.id!]));

      const links = linksToSave(graph, 1, stepIds);

      expect(links).toEqual(
        expect.arrayContaining([
          { name: '1-11', bound: 'out', stepId: 10, transport: 'sync' },
          { name: '1-11', bound: 'in', stepId: 11, transport: 'sync' },
          { name: '1-12', bound: 'out', stepId: 11, transport: 'sync' },
          { name: '1-12', bound: 'in', stepId: 12, transport: 'sync' },
          { name: '1-13', bound: 'out', stepId: 11, transport: 'sync', rule: 'check', language: 'simple', expression: 'x' },
          { name: '1-13', bound: 'in', stepId: 13, transport: 'sync' },
        ]),
      );
      expect(links).toHaveLength(6);
    });

    it('saves new and existing Steps with their settings and coordinates', () => {
      const graph = edited(moveStep(edited(insertStep(sourceToSink(), 'step-11', 'ACTION', 'setbody')), 'step-10', 40, 120));
      const action = graph.steps.find(s => s.kind === 'ACTION')!;

      const steps = stepsToSave(graph, 1);

      expect(steps.find(s => s.key === 'step-10')!.step).toMatchObject({ id: 10, stepType: 'SOURCE', flowId: 1, coordinateX: 40, coordinateY: 120 });
      expect(steps.find(s => s.key === action.key)!.step).toMatchObject({ id: undefined, stepType: 'ACTION', componentType: 'setbody', flowId: 1 });
    });

    it("drops the copy of a split Router's Condition from its options; the split Branch holds it", () => {
      const split = edited(insertStep(sourceToSink(), 'step-11', 'ROUTER', 'split'));
      const router = split.steps.find(s => s.kind === 'ROUTER')!;
      const graph = edited(updateStep(split, router.key, { options: 'language=xpath&expression=/persons/person&streaming=false' }));

      expect(stepsToSave(graph, 1).find(s => s.key === router.key)!.step.options).toBe('streaming=false');
    });
  });

  describe('arranging', () => {
    const expectTidyLayout = (graph: FlowGraph): void => {
      for (const s of graph.steps) {
        expect(typeof s.x).toBe('number');
        expect(typeof s.y).toBe('number');
      }
      for (const l of graph.links) {
        const from = graph.steps.find(s => s.key === l.from)!;
        const to = graph.steps.find(s => s.key === l.to)!;
        expect(to.x!).toBeGreaterThan(from.x!);
      }
      expect(new Set(graph.steps.map(s => `${s.x},${s.y}`)).size).toBe(graph.steps.length);
    };

    it('lays a Flow out from the Source on the left to the Sinks on the right', () => {
      const graph = edited(insertStep(contentRouterFlow(), 'step-13', 'ACTION', 'setbody'));

      expectTidyLayout(autoArrange(graph));
    });

    it('arranges a Flow that was saved without coordinates when it is loaded', () => {
      expectTidyLayout(contentRouterFlow());
    });

    it('places new Steps without moving the Steps the user already placed, and without overlapping them', () => {
      const placed = edited(moveStep(edited(moveStep(sourceToSink(), 'step-10', 0, 0)), 'step-11', 260, 0));

      const graph = edited(insertStep(placed, 'step-11', 'ROUTER', 'if'));

      expect(graph.steps.find(s => s.key === 'step-10')).toMatchObject({ x: 0, y: 0 });
      expect(graph.steps.find(s => s.key === 'step-11')).toMatchObject({ x: 260, y: 0 });
      for (const s of graph.steps) {
        expect(typeof s.x).toBe('number');
        expect(typeof s.y).toBe('number');
      }
      const overlapping = graph.steps.filter((a, i) =>
        graph.steps.some((b, j) => i !== j && Math.abs(a.x! - b.x!) < 200 && Math.abs(a.y! - b.y!) < 100),
      );
      expect(overlapping.map(s => s.key)).toEqual([]);
    });
  });
});
