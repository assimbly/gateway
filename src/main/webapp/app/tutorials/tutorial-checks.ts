import { HttpContext } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { LogViewerService } from 'app/admin/logviewer/logviewer.service';
import { ApiService } from 'app/entities/api/api.service';
import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { BrokerService } from 'app/entities/broker/broker.service';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { FlowService } from 'app/entities/flow/flow.service';
import { runtimeStatusOf } from 'app/entities/flow/flow-status';
import { QueueService } from 'app/entities/queue/queue.service';
import { IAddress } from 'app/shared/model/address.model';

/** A check runs every few seconds, and a Flow that isn't there (yet) is an answer, not an error to show. */
const QUIET = new HttpContext().set(HANDLES_OWN_ERRORS, true);

/** How many entries of a Flow's log a flowLog check reads. */
const LOG_ENTRIES = 200;

/**
 * Whether the user did what a tutorial step asks, read from the Gateway as it is. A check is written in the tutorial
 * as `kind:arguments`:
 *
 * - `flowExists:<name>`: there is a Flow with this name
 * - `apiExists:<name>`: there is an API with this name, in any case
 * - `connectionExists:<name>`: there is a Connection with this name
 * - `flowStep:<name>:<text>`: the saved Flow has a Step whose component or path contains the text
 * - `flowStatus:<name>:<status>`: the Flow is started, stopped, paused…
 * - `flowCompleted:<name>`, `flowFailed:<name>`, `flowAlerts:<name>`: the count went up since the step opened
 * - `flowLog:<name>:<text>`: the Flow's log contains the text
 * - `brokerStatus:<status>`: the Gateway's broker is started or stopped
 * - `queueExists:<name>`: the broker has a queue with this name
 * - `queueMessages:<name>`: the number of messages on the queue went up since the step opened
 * - `route:<text>`: the address of the page contains the text
 *
 * A check the panel doesn't know never passes, so the user moves on themselves.
 */
@Service()
export class TutorialChecks {
  private readonly apiService = inject(ApiService);
  private readonly brokerService = inject(BrokerService);
  private readonly connectionService = inject(ConnectionService);
  private readonly flowService = inject(FlowService);
  private readonly queueService = inject(QueueService);
  private readonly logViewerService = inject(LogViewerService);
  private readonly router = inject(Router);

  /** What a counting check compares with: the count when the step opened, or 0 when the Flow isn't there yet. */
  baseline(check: string): Observable<number> {
    const { kind, name } = parseCheck(check);
    if (kind === 'queueMessages') {
      return this.queueMessages(name);
    }
    return kind === 'flowCompleted' || kind === 'flowFailed' || kind === 'flowAlerts' ? this.count(kind, name) : of(0);
  }

  passes(check: string, baseline = 0): Observable<boolean> {
    const { kind, name, value } = parseCheck(check);
    switch (kind) {
      case 'flowExists':
        return this.flowId(name).pipe(map(id => id !== undefined));
      case 'apiExists':
        return this.apiService.query(QUIET).pipe(
          map(apis => apis.some(api => api.name?.toLowerCase() === name.toLowerCase())),
          catchError(() => of(false)),
        );
      case 'connectionExists':
        return this.connectionService.getAllConnections(QUIET).pipe(
          map(response => (response.body ?? []).some(connection => connection.name === name)),
          catchError(() => of(false)),
        );
      case 'flowStep':
        return this.flowService.findByName(name, QUIET, true).pipe(
          map(response =>
            (response.body?.steps ?? []).some(step =>
              `${step.componentType ?? ''} ${step.uri ?? ''}`.toLowerCase().includes(value.toLowerCase()),
            ),
          ),
          catchError(() => of(false)),
        );
      case 'flowStatus':
        return this.withFlow(name, id =>
          this.flowService.getFlowStatus(id, QUIET).pipe(map(response => runtimeStatusOf(response.body) === runtimeStatusOf(value))),
        );
      case 'flowCompleted':
      case 'flowFailed':
      case 'flowAlerts':
        return this.count(kind, name).pipe(map(count => count > baseline));
      case 'flowLog':
        return this.withFlow(name, id =>
          this.logViewerService.getLogs(LOG_ENTRIES, id, QUIET).pipe(map(response => (response.body ?? '').includes(value))),
        );
      case 'brokerStatus':
        return this.brokerService.getBrokers(QUIET).pipe(
          switchMap(response => {
            const broker = response.body?.[0];
            return broker?.id && broker.type ? this.brokerService.getBrokerStatus(broker.id, broker.type, QUIET) : of(undefined);
          }),
          map(response => response?.body === name),
          catchError(() => of(false)),
        );
      case 'queueExists':
        return this.queues().pipe(map(queues => queues.some(queue => queue.name === name)));
      case 'queueMessages':
        return this.queueMessages(name).pipe(map(count => count > baseline));
      case 'route':
        return of(this.router.url.includes(name));
      default:
        return of(false);
    }
  }

  private count(kind: string, name: string): Observable<number> {
    const counted = this.flowId(name).pipe(
      switchMap(id => {
        if (id === undefined) {
          return of(0);
        }
        if (kind === 'flowAlerts') {
          return this.flowService.getFlowAlertsPage(id, 0, 0, QUIET).pipe(map(response => response.body?.total ?? 0));
        }
        return this.flowService
          .getFlowTransactions(id, QUIET)
          .pipe(map(response => Number((kind === 'flowFailed' ? response.body?.flow.failed : response.body?.flow.completed) ?? 0)));
      }),
    );
    // a Flow that never ran has no counts yet
    return counted.pipe(catchError(() => of(0)));
  }

  private queueMessages(name: string): Observable<number> {
    return this.queues().pipe(map(queues => queues.find(queue => queue.name === name)?.numberOfMessages ?? 0));
  }

  /** The queues on the broker of this Gateway, or none when it has no broker or the broker is stopped. */
  private queues(): Observable<IAddress[]> {
    return this.brokerService.getBrokers(QUIET).pipe(
      switchMap(response => {
        const type = response.body?.[0]?.type;
        return type ? this.queueService.getAllQueues(type, QUIET).pipe(map(queues => queues.body?.queues?.queue ?? [])) : of([]);
      }),
      catchError(() => of([])),
    );
  }

  private withFlow(name: string, check: (id: number) => Observable<boolean>): Observable<boolean> {
    return this.flowId(name).pipe(
      switchMap(id => (id === undefined ? of(false) : check(id))),
      catchError(() => of(false)),
    );
  }

  /** The Flow the tutorial names, in any case: a user who types "Testflow" for "TestFlow" has still made it. */
  private flowId(name: string): Observable<number | undefined> {
    return this.flowService.findByName(name, QUIET, true).pipe(
      map(response => response.body?.id ?? undefined),
      catchError(() => of(undefined)),
    );
  }
}

/** `flowLog:DebugFlow:Cannot store file` → kind, the Flow (or text) it's about, and the rest, which may contain ':'. */
export function parseCheck(check: string): { kind: string; name: string; value: string } {
  const [kind = '', name = '', ...rest] = check.split(':');
  return { kind, name, value: rest.join(':') };
}
