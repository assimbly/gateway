import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faPlus } from '@fortawesome/free-solid-svg-icons';

import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { DesignerSelection, FlowCanvasComponent } from './flow-canvas.component';
import { loadFlowGraph } from './flow-graph';

const contentRouterFlow: IFlow = {
  id: 1,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'timer', links: [{ name: '1-11', bound: 'out' }] },
    {
      id: 11,
      stepType: 'ROUTER',
      componentType: 'content',
      links: [
        { name: '1-11', bound: 'in' },
        { name: '1-12', bound: 'out' },
        { name: '1-13', bound: 'out', rule: 'check', language: 'simple', expression: 'x' },
      ],
    },
    { id: 12, stepType: 'SINK', componentType: 'log', links: [{ name: '1-12', bound: 'in' }] },
    { id: 13, stepType: 'SINK', links: [{ name: '1-13', bound: 'in' }] },
  ] as IStep[],
};

describe('Flow canvas', () => {
  let fixture: ComponentFixture<FlowCanvasComponent>;

  beforeAll(() => {
    (globalThis as any).ResizeObserver ??= class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FlowCanvasComponent] });
    TestBed.inject(FaIconLibrary).addIcons(faPlus, faExclamationTriangle);
    fixture = TestBed.createComponent(FlowCanvasComponent);
    const graph = loadFlowGraph(contentRouterFlow);
    fixture.componentRef.setInput('graph', graph);
    fixture.componentRef.setInput('problems', [{ stepKey: 'step-13', message: 'Choose a component for this Step.' }]);
    fixture.detectChanges();
  });

  it('draws every Step with its kind and component, and marks incomplete Steps', () => {
    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));

    expect(steps.map(s => s.querySelector('.flow-step-kind')!.textContent!.trim())).toEqual(['SOURCE', 'ROUTER', 'SINK', 'SINK']);
    expect(steps.map(s => s.querySelector('.flow-step-label')!.textContent!.trim())).toEqual(['timer', 'content', 'log', 'choose a component']);
    expect(steps[3].classList).toContain('flow-step-problem');
  });

  it('labels the Branches of a Router with their name and Condition', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.flow-link-label')).map((l: any) => l.textContent.trim());

    expect(labels).toEqual(['default', 'check: x']);
  });

  it('reports which Step was clicked', () => {
    const selections: DesignerSelection[] = [];
    fixture.componentInstance.selectionChange.subscribe(selection => selections.push(selection));

    fixture.nativeElement.querySelectorAll('.flow-step')[1].click();

    expect(selections).toEqual([{ type: 'step', key: 'step-11' }]);
  });
});
