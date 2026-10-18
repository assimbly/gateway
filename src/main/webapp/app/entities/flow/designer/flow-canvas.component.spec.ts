import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCodeBranch, faCogs, faExclamationTriangle, faPlus, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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
    TestBed.inject(FaIconLibrary).addIcons(faPlus, faExclamationTriangle, faSignInAlt, faCogs, faCodeBranch, faSignOutAlt);
    fixture = TestBed.createComponent(FlowCanvasComponent);
    const graph = loadFlowGraph(contentRouterFlow);
    fixture.componentRef.setInput('graph', graph);
    fixture.componentRef.setInput('problems', [{ stepKey: 'step-13', message: 'Choose a component for this Step.' }]);
    fixture.detectChanges();
  });

  it('draws every Step with its kind and component, and marks incomplete Steps', () => {
    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));

    expect(steps.map(s => s.querySelector('.flow-step-kind')!.textContent!.trim())).toEqual(['SOURCE', 'ROUTER', 'SINK', 'SINK']);
    expect(steps.map(s => s.querySelector('.flow-step-label')!.textContent!.trim())).toEqual(['Timer', 'Content router', 'Log Data', 'choose a component']);
    expect(steps[3].classList).toContain('flow-step-problem');
  });

  it('shows the path of a Step under it, shortened in the middle when long', () => {
    const graph = loadFlowGraph({
      id: 3,
      steps: [
        { id: 20, stepType: 'SOURCE', componentType: 'file', uri: 'C:/messages/in', links: [{ name: '3-21', bound: 'out' }] },
        {
          id: 21,
          stepType: 'SINK',
          componentType: 'file',
          uri: 'C:/a/very/long/folder/name/for/outgoing/orders',
          links: [{ name: '3-21', bound: 'in' }],
        },
      ],
    } as IFlow);
    fixture.componentRef.setInput('graph', graph);
    fixture.detectChanges();

    const captions: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step-caption'));
    expect(captions.map(c => c.textContent!.trim())).toEqual(['C:/messages/in', 'C:/a/very/long…tgoing/orders']);
    expect(captions[1].title).toBe('C:/a/very/long/folder/name/for/outgoing/orders');
  });

  it('shows no path under a Router', () => {
    const router = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-step'))[1];

    expect(router.querySelector('.flow-step-caption')).toBeNull();
  });

  it('labels the Branches of a Router with their name and Condition', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.flow-link-label')).map((l: any) => l.textContent.trim());

    expect(labels).toEqual(['default', 'check: x']);
  });

  it('offers to add the next Step only after an open end', () => {
    expect(fixture.nativeElement.querySelectorAll('.flow-append')).toHaveLength(0);

    fixture.componentRef.setInput('graph', loadFlowGraph({ id: 2, steps: [] }));
    fixture.detectChanges();

    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));
    expect(steps).toHaveLength(1);
    expect(steps[0].querySelector('.flow-append')).not.toBeNull();
  });

  it('opens the + that fits the selection with the keyboard, and none after a Sink', () => {
    const canvas = fixture.componentInstance;

    expect(canvas.openStepPicker({ type: 'link', to: 'step-13' })).toBe(true);
    expect(canvas.openStepPicker({ type: 'step', key: 'step-10' })).toBe(true);
    expect(canvas.openStepPicker({ type: 'step', key: 'step-12' })).toBe(false);
    expect(canvas.openStepPicker({ type: 'flow' })).toBe(false);

    fixture.componentRef.setInput('graph', loadFlowGraph({ id: 2, steps: [] }));
    fixture.detectChanges();

    expect(canvas.openStepPicker({ type: 'flow' })).toBe(true);
  });

  it('reports which Step was clicked', () => {
    const selections: DesignerSelection[] = [];
    fixture.componentInstance.selectionChange.subscribe(selection => selections.push(selection));

    fixture.nativeElement.querySelectorAll('.flow-step')[1].click();

    expect(selections).toEqual([{ type: 'step', key: 'step-11' }]);
  });
});
