import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { IFlow } from 'app/shared/model/flow.model';
import { IStep } from 'app/shared/model/step.model';

import { FlowGraph, loadFlowGraph } from '../designer/flow-graph';
import { FlowService, IFlowStats } from '../flow.service';
import { FlowRunStatsComponent } from './flow-run-stats.component';

const flow: IFlow = {
  id: 1,
  steps: [
    { id: 10, stepType: 'SOURCE', componentType: 'timer', links: [{ name: '1-11', bound: 'out' }] },
    { id: 11, stepType: 'SINK', componentType: 'log', links: [{ name: '1-11', bound: 'in' }] },
  ] as IStep[],
};

const started: IFlowStats = { id: '1', status: 'started', uptimeMillis: 1000, transactionsTotal: 0 } as IFlowStats;

describe('Flow run stats', () => {
  let fixture: ComponentFixture<FlowRunStatsComponent>;
  let service: FlowService;
  let graph: FlowGraph;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlowRunStatsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FlowService);
    graph = loadFlowGraph(flow);
    fixture = TestBed.createComponent(FlowRunStatsComponent);
    fixture.componentRef.setInput('flowId', 1);
    fixture.componentRef.setInput('graph', graph);
  });

  function serve(stats: IFlowStats): void {
    jest.spyOn(service, 'getFlowStats').mockReturnValue(of(new HttpResponse({ body: { flow: stats } })));
    jest
      .spyOn(service, 'getFlowExchanges')
      .mockReturnValue(
        of({
          flow: { total: 3, completed: 2, failed: 1, pending: 0, steps: [{ id: '11', total: 3, completed: 2, failed: 1, pending: 0 }] },
        }),
      );
    jest.spyOn(service, 'getStepStats').mockReturnValue(of({ step: { id: '1-11', stats: { meanProcessingTime: 2 } } }));
  }

  it('gives the canvas the counts of each Step and shows the stats of the running Flow', fakeAsync(() => {
    serve(started);
    const counts = jest.fn();
    const status = jest.fn();
    fixture.componentInstance.countsChange.subscribe(counts);
    fixture.componentInstance.statusChange.subscribe(status);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const sink = graph.steps.find(step => step.kind === 'SINK')!;
    expect(counts).toHaveBeenCalledWith(new Map([[sink.key, { total: 3, completed: 2, failed: 1, pending: 0 }]]));
    expect(status).toHaveBeenCalledWith('active');
    expect(fixture.nativeElement.querySelector('h5').textContent).toBe('Flow');
    expect(fixture.nativeElement.textContent).toContain('Running for');
    discardPeriodicTasks();
  }));

  it('reads the stats of the selected Step straight away', fakeAsync(() => {
    serve(started);
    fixture.detectChanges();
    tick();

    const sink = graph.steps.find(step => step.kind === 'SINK')!;
    fixture.componentRef.setInput('selection', { type: 'step', key: sink.key });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(service.getStepStats).toHaveBeenCalledWith(1, 11);
    expect(fixture.nativeElement.querySelector('h5').textContent).toBe('Sink');
    discardPeriodicTasks();
  }));

  it('reads the stats again every few seconds', fakeAsync(() => {
    serve(started);
    fixture.detectChanges();
    tick();

    tick(5000);

    expect(service.getFlowStats).toHaveBeenCalledTimes(2);
    discardPeriodicTasks();
  }));

  it('says there are no stats while the Flow is stopped', fakeAsync(() => {
    serve({ id: '1', status: 'stopped' } as IFlowStats);
    const counts = jest.fn();
    const status = jest.fn();
    fixture.componentInstance.countsChange.subscribe(counts);
    fixture.componentInstance.statusChange.subscribe(status);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(counts).toHaveBeenCalledWith(undefined);
    expect(status).toHaveBeenCalledWith('inactive');
    expect(fixture.nativeElement.textContent).toContain("There are no stats while the Flow isn't running.");
    discardPeriodicTasks();
  }));

  it('tells a paused Flow from a stopped one', fakeAsync(() => {
    serve({ id: '1', status: 'suspended' } as IFlowStats);
    const status = jest.fn();
    fixture.componentInstance.statusChange.subscribe(status);

    fixture.detectChanges();
    tick();

    expect(status).toHaveBeenCalledWith('paused');
    discardPeriodicTasks();
  }));
});
