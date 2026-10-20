import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Observable, Subject, catchError, filter, forkJoin, map, merge, of, switchMap, timer } from 'rxjs';

import { IFlow } from 'app/shared/model/flow.model';
import { Components } from 'app/shared/camel/component-type';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { ApiService } from 'app/entities/api/api.service';
import { operationUrl } from 'app/entities/api/operation-url';
import { DesignStep, FlowGraph, loadFlowGraph, routerTitle } from '../designer/flow-graph';
import { DesignerSelection, FlowCanvasComponent } from '../designer/flow-canvas.component';
import { FlowService, IFlowCounts, IFlowStats, IStepCounts, IStepStats } from '../flow.service';
import { FlowStatsSection, countsByStepKey, flowStatsSections, stepStatsSections } from '../flow-stats';
import { FlowStatsSections } from '../flow-stats-sections.component';

/** How often the stats are read again while the page is in view. */
const REFRESH_MILLIS = 5000;

/** What one refresh read; a call that failed leaves its part undefined. */
interface StatsRead {
  flow?: IFlowStats;
  steps?: IStepCounts[];
  step?: IStepStats;
}

/**
 * The stats of a Flow drawn on the canvas, read-only: each Step shows the messages it completed and failed, and the
 * panel shows the stats of the Flow or of the selected Step. The stats are read again every few seconds.
 */
@Component({
  selector: 'jhi-flow-stats-page',
  templateUrl: './flow-stats-page.component.html',
  styleUrls: ['../designer/flow-designer.scss', './flow-stats-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FontAwesomeModule, FlowCanvasComponent, FlowStatsSections, HasAnyAuthorityDirective],
})
export class FlowStatsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly flowService = inject(FlowService);
  private readonly apiService = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titles = new Map<string, string>(inject(Components).types.map(type => [type.name, type.title ?? type.name]));
  private readonly refresh$ = new Subject<void>();

  flow?: IFlow;
  graph?: FlowGraph;
  operationUrl?: string;
  loadFailed = false;

  selection: DesignerSelection = { type: 'flow' };
  /** The stats of the Flow; undefined until they were read. */
  flowStats?: IFlowStats;
  /** Whether the stats were read at least once. */
  read = false;
  counts?: Map<string, IFlowCounts>;
  /** The stats of the selected Step, read with every refresh. */
  stepStats?: IStepStats;
  sections: FlowStatsSection[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin([this.flowService.find(id), this.apiService.handlerOf(id)]).subscribe({
      next: ([response, handler]) => {
        this.flow = response.body ?? undefined;
        if (this.flow) {
          this.graph = loadFlowGraph(this.flow, handler);
          if (handler) {
            this.apiService.listenerUrl().subscribe({
              next: listener => {
                this.operationUrl = operationUrl(listener, handler.runtimePath);
                this.cdr.markForCheck();
              },
              error: () => undefined,
            });
          }
          this.pollStats(id);
        } else {
          this.loadFailed = true;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadFailed = true;
        this.cdr.markForCheck();
      },
    });
  }

  get running(): boolean {
    return this.flowStats?.status?.toLowerCase() === 'started';
  }

  get selectedStep(): DesignStep | undefined {
    const selection = this.selection;
    return selection.type === 'step' ? this.graph?.steps.find(step => step.key === selection.key) : undefined;
  }

  /** What the panel shows: the stats of the selected Step, or else of the Flow. */
  private updateSections(): void {
    const step = this.selectedStep;
    if (!this.running) {
      this.sections = [];
    } else {
      this.sections = step ? stepStatsSections(this.counts?.get(step.key), this.stepStats) : flowStatsSections(this.flowStats!);
    }
  }

  /** What the selected Step is, as on the canvas: its component, or what kind of Router it is. */
  stepTitle(step: DesignStep): string {
    if (step.kind === 'ROUTER') {
      return routerTitle(step);
    }
    return step.componentType ? (this.titles.get(step.componentType) ?? step.componentType) : 'Step';
  }

  get editorQueryParams(): Record<string, unknown> {
    return { mode: 'edit', editor: this.flow?.type, id: this.flow?.id };
  }

  /** A Link shows the Flow's stats: a Link has none of its own. */
  onSelectionChange(selection: DesignerSelection): void {
    this.selection = selection.type === 'link' ? { type: 'flow' } : selection;
    this.stepStats = undefined;
    this.updateSections();
    this.cdr.markForCheck();
    this.refresh();
  }

  refresh(): void {
    this.refresh$.next();
  }

  private pollStats(flowId: number): void {
    merge(timer(0, REFRESH_MILLIS).pipe(filter(() => !document.hidden)), this.refresh$)
      .pipe(
        switchMap(() => this.readStats(flowId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.read = true;
        this.flowStats = result.flow;
        this.counts = this.running && result.steps && this.graph ? countsByStepKey(this.graph, result.steps) : undefined;
        this.stepStats = result.step;
        this.updateSections();
        this.cdr.markForCheck();
      });
  }

  private readStats(flowId: number): Observable<StatsRead> {
    const stepId = this.selectedStep?.id;
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
