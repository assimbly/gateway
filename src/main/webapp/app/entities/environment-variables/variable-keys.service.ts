import { Injectable, inject } from '@angular/core';
import { Observable, Subject, catchError, fromEvent, map, merge, of, shareReplay, startWith, switchMap } from 'rxjs';

import { EnvironmentVariablesService } from './environment-variables.service';

/** Enough for every Variable of a Gateway; the list is only used to pick from and to check references. */
const ALL_VARIABLES = 1000;

/** A Variable as an editor shows it: an encrypted one's value is the stored ciphertext, so it is never shown. */
export interface KnownVariable {
  key: string;
  value: string;
  encrypted: boolean;
}

/**
 * The keys of the Variables, shared by every editor on the page. They are loaded again when the window gets the focus
 * back, so a Variable added in another tab (Manage Variables opens one) is known on return. If they can't be loaded
 * the keys are null, so references are not checked rather than all reported as unknown.
 */
@Injectable({ providedIn: 'root' })
export class VariableKeysService {
  private readonly variables = inject(EnvironmentVariablesService);
  private readonly reload = new Subject<void>();

  /** The Variables sorted A–Z by key, or null when they couldn't be loaded. */
  private readonly variables$: Observable<KnownVariable[] | null> = merge(this.reload, fromEvent(window, 'focus')).pipe(
    startWith(undefined),
    switchMap(() =>
      this.variables.query({ page: 0, size: ALL_VARIABLES, sort: ['key,asc'] }).pipe(
        map(response =>
          (response.body ?? [])
            .filter(variable => variable.key)
            .map(variable => ({ key: variable.key!, value: variable.value ?? '', encrypted: !!variable.encrypted })),
        ),
        catchError(() => of(null)),
      ),
    ),
    shareReplay(1),
  );

  private readonly values$: Observable<Record<string, string> | null> = this.variables$.pipe(
    map(variables => (variables ? Object.fromEntries(variables.map(variable => [variable.key, variable.value])) : null)),
    shareReplay(1),
  );

  private readonly keys$: Observable<string[] | null> = this.variables$.pipe(
    map(variables => (variables ? variables.map(variable => variable.key) : null)),
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

  /** The Variables sorted A–Z by key, with whether each is encrypted, to show them; null when unknown. */
  known(): Observable<KnownVariable[] | null> {
    return this.variables$;
  }

  /** Loads the keys again, for instance after a Variable was added. */
  refresh(): void {
    this.reload.next();
  }
}
