import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { forkJoin } from 'rxjs';

import { IFlow } from 'app/shared/model/flow.model';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { ApiService } from 'app/entities/api/api.service';
import { operationUrl } from 'app/entities/api/operation-url';
import { FlowGraph, loadFlowGraph } from '../designer/flow-graph';
import { DesignerSelection, FlowCanvasComponent } from '../designer/flow-canvas.component';
import { FlowService, IFlowCounts } from '../flow.service';
import { FlowRunStatsComponent } from './flow-run-stats.component';

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
  imports: [RouterLink, FontAwesomeModule, FlowCanvasComponent, FlowRunStatsComponent, HasAnyAuthorityDirective],
})
export class FlowStatsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly flowService = inject(FlowService);
  private readonly apiService = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly stats = viewChild(FlowRunStatsComponent);

  flow?: IFlow;
  graph?: FlowGraph;
  operationUrl?: string;
  loadFailed = false;

  selection: DesignerSelection = { type: 'flow' };
  /** Whether the stats were read at least once. */
  read = false;
  running = false;
  counts?: Map<string, IFlowCounts>;

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

  get editorQueryParams(): Record<string, unknown> {
    return { mode: 'edit', editor: this.flow?.type, id: this.flow?.id };
  }

  /** A Link shows the Flow's stats: a Link has none of its own. */
  onSelectionChange(selection: DesignerSelection): void {
    this.selection = selection.type === 'link' ? { type: 'flow' } : selection;
    this.cdr.markForCheck();
  }

  onRunningChange(running: boolean): void {
    this.read = true;
    this.running = running;
    this.cdr.markForCheck();
  }

  onCountsChange(counts: Map<string, IFlowCounts> | undefined): void {
    this.counts = counts;
    this.cdr.markForCheck();
  }

  refresh(): void {
    this.stats()?.refresh();
  }
}
