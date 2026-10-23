import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, distinctUntilChanged, filter, forkJoin, map, merge, of, switchMap, tap, timer } from 'rxjs';

import { Components } from 'app/shared/camel/component-type';
import { DesignStep, FlowGraph, routerTitle } from '../designer/flow-graph';
import { DesignerSelection } from '../designer/flow-canvas.component';
import { FlowService, IFlowCounts, IFlowStats, IStepCounts, IStepStats } from '../flow.service';
import { FlowStatsSection, countsByStepKey, flowStatsSections, stepStatsSections } from '../flow-stats';
import { FlowStatsSections } from '../flow-stats-sections.component';

/** How often the stats are read again while they are in view. */
const REFRESH_MILLIS = 5000;

/** What one refresh read; a call that failed leaves its part undefined. */
interface StatsRead {
  flow?: IFlowStats;
  steps?: IStepCounts[];
  step?: IStepStats;
}

/**
 * The stats of a running Flow, or of its selected Step, read again every few seconds. It also hands the completed and
 * failed messages of each Step to the canvas. Used on a Flow's stats page and in the Test mode of the visual editor.
 */
@Component({
  selector: 'jhi-flow-run-stats',
  templateUrl: './flow-run-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlowStatsSections],
})
export class FlowRunStatsComponent {
  readonly flowId = input<number | null | undefined>();
  readonly graph = input<FlowGraph | undefined>();
  readonly selection = input<DesignerSelection>({ type: 'flow' });

  /** The completed and failed messages of each Step, for the canvas; undefined while the Flow isn't running. */
  readonly countsChange = output<Map<string, IFlowCounts> | undefined>();
  /** Whether the Flow runs, after every read of its stats. */
  readonly runningChange = output<boolean>();

  /** Whether the stats were read at least once. */
  readonly read = signal(false);
  readonly flowStats = signal<IFlowStats | undefined>(undefined);
  readonly counts = signal<Map<string, IFlowCounts> | undefined>(undefined);
  /** The stats of the selected Step, read with every refresh. */
  readonly stepStats = signal<IStepStats | undefined>(undefined);

  readonly running = computed(() => this.flowStats()?.status?.toLowerCase() === 'started');

  /** A Link shows the Flow's stats: a Link has none of its own. */
  readonly selectedStep = computed<DesignStep | undefined>(() => {
    const selection = this.selection();
    return selection.type === 'step' ? this.graph()?.steps.find(step => step.key === selection.key) : undefined;
  });

  /** What the panel shows: the stats of the selected Step, or else of the Flow. */
  readonly sections = computed<FlowStatsSection[]>(() => {
    if (!this.running()) {
      return [];
    }
    const step = this.selectedStep();
    return step ? stepStatsSections(this.counts()?.get(step.key), this.stepStats()) : flowStatsSections(this.flowStats()!);
  });

  private readonly flowService = inject(FlowService);
  private readonly titles = new Map<string, string>(inject(Components).types.map(type => [type.name, type.title ?? type.name]));
  private readonly refresh$ = new Subject<void>();

  constructor() {
    const target = computed(() => ({ flowId: this.flowId(), stepId: this.selectedStep()?.id }));
    toObservable(target)
      .pipe(
        distinctUntilChanged((a, b) => a.flowId === b.flowId && a.stepId === b.stepId),
        // Another Step's stats are read straight away; until then the panel shows none rather than the last Step's.
        tap(() => this.stepStats.set(undefined)),
        switchMap(({ flowId, stepId }) =>
          flowId
            ? merge(timer(0, REFRESH_MILLIS).pipe(filter(() => !document.hidden)), this.refresh$).pipe(switchMap(() => this.readStats(flowId, stepId)))
            : EMPTY,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        this.read.set(true);
        this.flowStats.set(result.flow);
        const graph = this.graph();
        const counts = this.running() && result.steps && graph ? countsByStepKey(graph, result.steps) : undefined;
        this.counts.set(counts);
        this.stepStats.set(result.step);
        this.countsChange.emit(counts);
        this.runningChange.emit(this.running());
      });
  }

  refresh(): void {
    this.refresh$.next();
  }

  /** What the selected Step is, as on the canvas: its component, or what kind of Router it is. */
  stepTitle(step: DesignStep): string {
    if (step.kind === 'ROUTER') {
      return routerTitle(step);
    }
    return step.componentType ? (this.titles.get(step.componentType) ?? step.componentType) : 'Step';
  }

  private readStats(flowId: number, stepId: number | undefined): Observable<StatsRead> {
    return forkJoin({
      flow: orUndefined(this.flowService.getFlowStats(flowId).pipe(map(response => response.body?.flow))),
      steps: orUndefined(this.flowService.getFlowExchanges(flowId).pipe(map(response => response.flow?.steps ?? []))),
      step: stepId != null ? orUndefined(this.flowService.getStepStats(flowId, stepId).pipe(map(response => response.step))) : of(undefined),
    });
  }
}

/** A failed read gives undefined, so one failed call doesn't stop the others or the refreshes. */
function orUndefined<T>(source: Observable<T>): Observable<T | undefined> {
  return source.pipe(catchError(() => of(undefined)));
}
