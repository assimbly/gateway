import { problems } from '../designer/flow-graph';

import { FLOW_TEMPLATES, templateFlow } from './flow-templates';
import { STARTER_FLOW, STARTER_ROUTE } from './starter-flow';

describe('Starter Flow', () => {
  it('opens a new Visual Flow complete: a once Source logged with its body', () => {
    const { graph, steps } = templateFlow(STARTER_FLOW);

    expect(problems(graph)).toEqual([]);
    expect(graph.steps.map(step => [step.kind, step.componentType, step.uri])).toEqual([
      ['SOURCE', 'once', 'hello'],
      ['SINK', 'log', 'hello'],
    ]);
    expect(graph.links).toEqual([expect.objectContaining({ from: 'starter-source', to: 'starter-sink' })]);
    expect(steps.get('starter-source')?.options).toBe('body=Hello world');
  });

  it('is not one of the Example Flows', () => {
    expect(FLOW_TEMPLATES).not.toContain(STARTER_FLOW);
  });

  it('starts a new Camel route from the same once Source, with one option', () => {
    const route = new DOMParser().parseFromString(STARTER_ROUTE, 'application/xml');

    expect(route.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(route.documentElement.tagName).toBe('route');
    expect(route.querySelector('from')?.getAttribute('uri')).toBe('once:hello?body=Hello world');
    expect(STARTER_ROUTE).not.toContain('&');
  });
});
