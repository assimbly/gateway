import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { FlowService } from 'app/entities/flow/flow.service';
import { RuntimeStatus, runtimeStatusOf } from 'app/entities/flow/flow-status';
import { isDraft, loadFlowGraph, opensOnCanvas } from 'app/entities/flow/designer/flow-graph';
import { IApi, IApiOperation } from './api.model';

/** What an API page shows of a Handler Flow: its Flow status, and whether it is a Draft. */
export interface HandlerFlowState {
  status: RuntimeStatus;
  draft: boolean;
}

/**
 * The Handler Flows of an API, read Flow by Flow. Whether a Flow is a Draft is only known from its design. The Flows
 * are started and stopped on their own pages; an API has no Start or Stop.
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
}
