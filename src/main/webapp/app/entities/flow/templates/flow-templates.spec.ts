import { defaultBranch, problems } from '../designer/flow-graph';

import { FLOW_TEMPLATES, flowTemplate, templateFlow } from './flow-templates';

describe('Example Flows', () => {
  it.each(FLOW_TEMPLATES.map(template => [template.id, template] as const))(
    '%s opens as a complete tree whose only gaps are the paths to fill in',
    (_id, template) => {
      const { graph, steps } = templateFlow(template);

      expect(graph.repaired).toBe(false);
      expect(graph.steps.every(step => step.x !== undefined && step.y !== undefined)).toBe(true);
      expect(problems(graph)).toEqual([]);
      graph.steps.forEach(step => expect(steps.get(step.key)?.stepType).toBe(step.kind));
    },
  );

  it('routes by content with one named Branch and the Default branch', () => {
    const { graph } = templateFlow(flowTemplate('route-by-content')!);
    const router = graph.steps.find(step => step.kind === 'ROUTER')!;
    const branches = graph.links.filter(link => link.from === router.key);

    expect(branches).toHaveLength(2);
    expect(branches.find(link => link.rule === 'urgent')).toEqual(
      expect.objectContaining({ language: 'simple', expression: "${body} contains 'urgent'" }),
    );
    expect(defaultBranch(graph, router)?.to).toBe('example-other');
  });

  it('knows no Example Flow by an unknown id', () => {
    expect(flowTemplate('nope')).toBeUndefined();
    expect(flowTemplate(undefined)).toBeUndefined();
  });
});
