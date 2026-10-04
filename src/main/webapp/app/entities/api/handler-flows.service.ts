import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { FlowService } from 'app/entities/flow/flow.service';
import { RuntimeStatus, failureOfError, flowFailureOf, runtimeStatusOf } from 'app/entities/flow/flow-status';
import { isDraft, loadFlowGraph, opensOnCanvas } from 'app/entities/flow/designer/flow-graph';
import { IApi, IApiOperation } from './api.model';

/** What an API page shows of a Handler Flow: its Flow status, and whether it is a Draft. */
export interface HandlerFlowState {
  status: RuntimeStatus;
  draft: boolean;
}

/** What starting or stopping a whole API did. */
export interface ApiRunReport {
  done: number;
  skippedDrafts: number;
  failed: { operation: IApiOperation; message: string }[];
}

/**
 * The Handler Flows of an API, read and run Flow by Flow. Whether a Flow is a Draft is only known from its design, so
 * starting an API is done here: the Drafts are skipped and counted.
 */
@Injectable({ providedIn: 'root' })
export class HandlerFlowsService {
  private readonly flowService = inject(FlowService);

  /** The state of each Operation's Handler Flow, by Flow id. */
  states(api: IApi): Observable<Map<number, HandlerFlowState>> {
    const operations = (api.operations ?? []).filter(o => o.handlerFlowId);
    if (!operations.length) {
      return of(new Map());
    }
    return forkJoin(operations.map(operation => this.state(api, operation))).pipe(
      map(states => new Map(operations.map((operation, i) => [operation.handlerFlowId!, states[i]]))),
    );
  }

  state(api: IApi, operation: IApiOperation): Observable<HandlerFlowState> {
    const flowId = operation.handlerFlowId!;
    const status$ = this.flowService.getFlowStatus(flowId).pipe(
      map(response => runtimeStatusOf(response.body)),
      catchError(() => of<RuntimeStatus>('inactive')),
    );
    const draft$ = this.flowService.find(flowId).pipe(
      map(response => {
        const flow = response.body!;
        const handler = { method: operation.method, fullPath: operation.fullPath ?? operation.path, declaredStatuses: operation.declaredResponses.map(r => r.status) };
        return opensOnCanvas(flow.type) && isDraft(loadFlowGraph(flow, handler));
      }),
      catchError(() => of(false)),
    );
    return forkJoin([status$, draft$]).pipe(map(([status, draft]) => ({ status, draft })));
  }

  /** Starts every Handler Flow that isn't a Draft; the Drafts are skipped and counted. */
  start(api: IApi, states: Map<number, HandlerFlowState>): Observable<ApiRunReport> {
    const operations = (api.operations ?? []).filter(o => o.handlerFlowId);
    const toStart = operations.filter(o => !states.get(o.handlerFlowId!)?.draft);
    return this.runEach(toStart, id => this.flowService.configureAndStart(id)).pipe(
      map(report => ({ ...report, skippedDrafts: operations.length - toStart.length })),
    );
  }

  stop(api: IApi): Observable<ApiRunReport> {
    return this.runEach((api.operations ?? []).filter(o => o.handlerFlowId), id => this.flowService.stop(id));
  }

  private runEach(operations: IApiOperation[], action: (flowId: number) => Observable<{ body: string | null }>): Observable<ApiRunReport> {
    if (!operations.length) {
      return of({ done: 0, skippedDrafts: 0, failed: [] });
    }
    const runs = operations.map(operation =>
      action(operation.handlerFlowId!).pipe(
        map(response => flowFailureOf(response.body)),
        catchError(error => of(failureOfError(error?.error ?? error))),
        map(failure => ({ operation, failure })),
      ),
    );
    return forkJoin(runs).pipe(
      map(results => ({
        done: results.filter(r => !r.failure).length,
        skippedDrafts: 0,
        failed: results.filter(r => r.failure).map(r => ({ operation: r.operation, message: r.failure!.summary })),
      })),
    );
  }
}
