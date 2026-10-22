import { Injectable, inject } from '@angular/core';
import { Observable, Subject, catchError, fromEvent, map, merge, of, shareReplay, startWith, switchMap } from 'rxjs';

import { EnvironmentVariablesService } from './environment-variables.service';

/** Enough for every Variable of a Gateway; the list is only used to pick from and to check references. */
const ALL_VARIABLES = 1000;

/**
 * The keys of the Variables, shared by every editor on the page. They are loaded again when the window gets the focus
 * back, so a Variable added in another tab (Manage Variables opens one) is known on return. If they can't be loaded
 * the keys are null, so references are not checked rather than all reported as unknown.
 */
@Injectable({ providedIn: 'root' })
export class VariableKeysService {
  private readonly variables = inject(EnvironmentVariablesService);
  private readonly reload = new Subject<void>();

  /** Each Variable's value by its key, or null when they couldn't be loaded. */
  private readonly values$: Observable<Record<string, string> | null> = merge(this.reload, fromEvent(window, 'focus')).pipe(
    startWith(undefined),
    switchMap(() =>
      this.variables.query({ page: 0, size: ALL_VARIABLES, sort: ['key,asc'] }).pipe(
        map(response =>
          Object.fromEntries((response.body ?? []).filter(variable => variable.key).map(variable => [variable.key!, variable.value ?? ''])),
        ),
        catchError(() => of(null)),
      ),
    ),
    shareReplay(1),
  );

  private readonly keys$: Observable<string[] | null> = this.values$.pipe(
    map(values => (values ? Object.keys(values) : null)),
    shareReplay(1),
  );

  /** The keys sorted A–Z, or null when they couldn't be loaded. */
  keys(): Observable<string[] | null> {
    return this.keys$;
  }

  /** Each Variable's value by its key, to put in where a page sends to an endpoint itself; null when unknown. */
  values(): Observable<Record<string, string> | null> {
    return this.values$;
  }

  /** Loads the keys again, for instance after a Variable was added. */
  refresh(): void {
    this.reload.next();
  }
}
