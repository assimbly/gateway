import { ILink, Link } from 'app/shared/model/link.model';
import { IStep } from 'app/shared/model/step.model';

/**
 * The Links of the Steps of a Flow that run one after the other, as the code editors save them. A Source, Action or
 * Route links out under its own name; an Action, Sink, Route or Script links in under the name of the Step before it.
 * A Script links out only when another Step follows it. The Error handler isn't part of the chain.
 */
export function chainLinks(flowId: number | undefined, steps: IStep[]): ILink[] {
  const links: ILink[] = [];
  const chain = steps.filter(step => step.stepType !== 'ERROR');
  let previousStepId = 0;

  chain.forEach((step, index) => {
    const hasNext = index < chain.length - 1;
    if (step.stepType === 'ACTION' || step.stepType === 'SOURCE' || step.stepType === 'ROUTE' || (step.stepType === 'SCRIPT' && hasNext)) {
      links.push(link(`${flowId}-${step.id}`, step.id!, 'out'));
    }

    const linksIn = step.stepType === 'ACTION' || step.stepType === 'SINK' || step.stepType === 'ROUTE' || step.stepType === 'SCRIPT';
    if (linksIn && previousStepId !== 0) {
      links.push(link(`${flowId}-${previousStepId}`, step.id!, 'in'));
    }

    previousStepId = step.id!;
  });

  return links;
}

function link(name: string, stepId: number, bound: string): ILink {
  return Object.assign(new Link(), { name, bound, transport: 'sync', stepId });
}
