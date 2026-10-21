import { HttpContext } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { LogViewerService } from 'app/admin/logviewer/logviewer.service';
import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { FlowService } from 'app/entities/flow/flow.service';
import { runtimeStatusOf } from 'app/entities/flow/flow-status';

/** A check runs every few seconds, and a Flow that isn't there (yet) is an answer, not an error to show. */
const QUIET = new HttpContext().set(HANDLES_OWN_ERRORS, true);

/** How many entries of a Flow's log a flowLog check reads. */
const LOG_ENTRIES = 200;

/**
 * Whether the user did what a tutorial step asks, read from the Gateway as it is. A check is written in the tutorial
 * as `kind:arguments`:
 *
 * - `flowExists:<name>`: there is a Flow with this name
 * - `flowStatus:<name>:<status>`: the Flow is started, stopped, paused…
 * - `flowCompleted:<name>`, `flowFailed:<name>`, `flowAlerts:<name>`: the count went up since the step opened
 * - `flowLog:<name>:<text>`: the Flow's log contains the text
 * - `route:<text>`: the address of the page contains the text
 *
 * A check the panel doesn't know never passes, so the user moves on themselves.
 */
@Service()
export class TutorialChecks {
  private readonly flowService = inject(FlowService);
  private readonly logViewerService = inject(LogViewerService);
  private readonly router = inject(Router);

  /** What a counting check compares with: the count when the step opened, or 0 when the Flow isn't there yet. */
  baseline(check: string): Observable<number> {
    const { kind, name } = parseCheck(check);
    return kind === 'flowCompleted' || kind === 'flowFailed' || kind === 'flowAlerts' ? this.count(kind, name) : of(0);
  }

  passes(check: string, baseline = 0): Observable<boolean> {
    const { kind, name, value } = parseCheck(check);
    switch (kind) {
      case 'flowExists':
        return this.flowId(name).pipe(map(id => id !== undefined));
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

  private withFlow(name: string, check: (id: number) => Observable<boolean>): Observable<boolean> {
    return this.flowId(name).pipe(
      switchMap(id => (id === undefined ? of(false) : check(id))),
      catchError(() => of(false)),
    );
  }

  private flowId(name: string): Observable<number | undefined> {
    return this.flowService.findByName(name, QUIET).pipe(
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
