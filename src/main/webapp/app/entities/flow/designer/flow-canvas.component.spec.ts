import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FZoomDirective } from '@foblex/flow';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheck, faCodeBranch, faCogs, faExclamationTriangle, faPlus, faSignInAlt, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { DesignerSelection, FlowCanvasComponent } from './flow-canvas.component';
import { loadFlowGraph } from './flow-graph';
import { StepRunMark } from '../test/flow-test-run';

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
    TestBed.inject(FaIconLibrary).addIcons(faPlus, faExclamationTriangle, faSignInAlt, faCogs, faCodeBranch, faSignOutAlt, faCheck, faTimes);
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

  it('shows no message counts unless it is given them', () => {
    expect(fixture.nativeElement.querySelectorAll('.flow-step-counts')).toHaveLength(0);
  });

  it('shows the completed and failed messages of each Step as badges, but no badge for none', () => {
    fixture.componentRef.setInput(
      'counts',
      new Map([
        ['step-10', { total: 1234, completed: 1234, failed: 0, pending: 0 }],
        ['step-11', { total: 5, completed: 3, failed: 2, pending: 0 }],
      ]),
    );
    fixture.detectChanges();

    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));
    const badges = (step: HTMLElement) => Array.from(step.querySelectorAll<HTMLElement>('.flow-step-count')).map(b => [b.className.split('--')[1], b.textContent!.trim(), b.title]);

    expect(badges(steps[0])).toEqual([['completed', '1.2k', '1,234 completed']]);
    expect(badges(steps[1])).toEqual([
      ['completed', '3', '3 completed'],
      ['failed', '2', '2 failed'],
    ]);
    expect(steps[2].querySelector('.flow-step-counts')).toBeNull();
  });

  it('reports which Step was clicked', () => {
    const selections: DesignerSelection[] = [];
    fixture.componentInstance.selectionChange.subscribe(selection => selections.push(selection));

    fixture.nativeElement.querySelectorAll('.flow-step')[1].click();

    expect(selections).toEqual([{ type: 'step', key: 'step-11' }]);
  });

  it('reports several selected Steps as one selection, and marks each of them', () => {
    const selections: DesignerSelection[] = [];
    fixture.componentInstance.selectionChange.subscribe(selection => selections.push(selection));

    fixture.componentInstance.onSelectionChange({ nodeIds: ['step-11', 'step-12'], connectionIds: [] } as any);
    fixture.componentRef.setInput('selection', selections[0]);
    fixture.detectChanges();

    expect(selections).toEqual([{ type: 'steps', keys: ['step-11', 'step-12'] }]);
    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));
    expect(steps.map(s => s.classList.contains('flow-step-selected'))).toEqual([false, true, true, false]);
  });

  it('selects every Step at once', () => {
    const selections: DesignerSelection[] = [];
    fixture.componentInstance.selectionChange.subscribe(selection => selections.push(selection));

    fixture.componentInstance.selectAllSteps();

    expect(selections).toEqual([{ type: 'steps', keys: ['step-10', 'step-11', 'step-12', 'step-13'] }]);
  });

  it('offers a × only on Steps that can be deleted, and reports which one was clicked', () => {
    const deleted: string[] = [];
    const selections: DesignerSelection[] = [];
    fixture.componentInstance.deleteStep.subscribe(key => deleted.push(key));
    fixture.componentInstance.selectionChange.subscribe(selection => selections.push(selection));
    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));

    // The Source starts every Flow, and the Default branch can't go.
    expect(steps.map(s => !!s.querySelector('.flow-step-delete'))).toEqual([false, true, false, true]);

    steps[1].querySelector<HTMLElement>('.flow-step-delete')!.click();

    expect(deleted).toEqual(['step-11']);
    expect(selections).toEqual([]);
  });

  describe('naming a Step', () => {
    function names(): string[] {
      return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.flow-step-name')).map(n => n.textContent!.trim());
    }

    function typeName(key: string, name: string, key2: 'Enter' | 'Escape'): { key: string; name: string }[] {
      const renamed: { key: string; name: string }[] = [];
      fixture.componentInstance.renameStep.subscribe(event => renamed.push(event));
      fixture.componentInstance.editName(key);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('.flow-step-name-input') as HTMLInputElement;
      input.value = name;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: key2 }));
      if (key2 === 'Enter') {
        // Enter blurs the field, which jsdom doesn't do on its own.
        input.dispatchEvent(new Event('blur'));
      }
      fixture.detectChanges();
      return renamed;
    }

    it('shows the name under the Step instead of its path', () => {
      const graph = loadFlowGraph(contentRouterFlow);
      fixture.componentRef.setInput('graph', { ...graph, steps: graph.steps.map(s => (s.key === 'step-12' ? { ...s, name: 'Log orders' } : s)) });
      fixture.detectChanges();

      expect(names()).toEqual(['Log orders']);
    });

    it('reports the name typed under a Step on Enter', () => {
      expect(typeName('step-12', 'Log orders', 'Enter')).toEqual([{ key: 'step-12', name: 'Log orders' }]);
      expect(fixture.nativeElement.querySelector('.flow-step-name-input')).toBeNull();
    });

    it('keeps the name as it was on Escape', () => {
      expect(typeName('step-12', 'Log orders', 'Escape')).toEqual([]);
      expect(fixture.nativeElement.querySelector('.flow-step-name-input')).toBeNull();
    });

    it('offers no name field when read-only', () => {
      fixture.componentRef.setInput('readOnly', true);
      fixture.componentInstance.editName('step-12');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.flow-step-name-input')).toBeNull();
    });
  });

  it('offers no × when read-only', () => {
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.flow-step-delete')).toHaveLength(0);
  });

  it('marks what each Step did in a test run: the Source gave the input, a Step failed, a Step was never reached', () => {
    const message = { body: 'x', headers: {}, truncated: false };
    fixture.componentRef.setInput(
      'runResults',
      new Map<string, StepRunMark>([
        ['step-10', 'input'],
        ['step-11', { stepId: '11', status: 'completed', startedAt: '', ownMillis: 4, totalMillis: 1500, in: message, out: message }],
        ['step-12', { stepId: '12', status: 'failed', startedAt: '', ownMillis: 1200, totalMillis: 1200, in: message, out: null, error: 'Disk full' }],
        ['step-13', 'unreached'],
      ]),
    );
    fixture.detectChanges();

    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.flow-step'));
    const badge = (step: HTMLElement) => step.querySelector<HTMLElement>('.flow-step-run')?.textContent!.trim();

    expect(steps.map(badge)).toEqual(['Test input', '4 ms', '1.2 s', undefined]);
    expect(steps[1].classList).toContain('flow-step-run-ok');
    expect(steps[2].classList).toContain('flow-step-run-failed');
    expect(steps[2].querySelector<HTMLElement>('.flow-step-run')!.title).toBe('Failed: Disk full. 1.2 s in this Step, 1.2 s with the Steps after it.');
    expect(steps[3].classList).toContain('flow-step-run-unreached');
  });

  it('zooms the canvas in and out around the middle of the view, as the mouse wheel does', () => {
    const zoom = fixture.debugElement.query(By.directive(FZoomDirective)).injector.get(FZoomDirective);
    const zoomIn = jest.spyOn(zoom, 'zoomIn').mockImplementation(() => undefined);
    const zoomOut = jest.spyOn(zoom, 'zoomOut').mockImplementation(() => undefined);

    fixture.componentInstance.zoomIn();
    fixture.componentInstance.zoomOut();

    expect(zoomIn).toHaveBeenCalledWith();
    expect(zoomOut).toHaveBeenCalledWith();
  });
});
