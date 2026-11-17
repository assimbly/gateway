import { HttpContext } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { Observable, catchError, map, of } from 'rxjs';

import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { ApiService } from 'app/entities/api/api.service';
import { FlowService } from 'app/entities/flow/flow.service';

/** A Flow or API the user hasn't made yet is an answer, not an error to show. */
const QUIET = new HttpContext().set(HANDLES_OWN_ERRORS, true);

/**
 * The page a Show me button points into, as the tutorial names it after its selector, in
 * `<!-- show: selector @ page -->`:
 *
 * - `/queue`: a route, as it is
 * - `flow:<name>`: the editor of the Flow with this name; `flow:<name>:test` opens it in Test
 * - `api:<name>`: the page of the API with this name
 */
@Service()
export class TutorialPages {
  private readonly router = inject(Router);
  private readonly flowService = inject(FlowService);
  private readonly apiService = inject(ApiService);

  /** Where the page is, or undefined when the tutorial's Flow or API isn't there (yet). */
  url(page: string): Observable<UrlTree | undefined> {
    if (page.startsWith('/')) {
      return of(this.router.parseUrl(page));
    }
    const [kind, name = '', view] = page.split(':');
    if (kind === 'flow') {
      return this.flowService.findByName(name, QUIET, true).pipe(
        map(response => response.body),
        map(flow =>
          flow?.id === undefined
            ? undefined
            : this.router.createUrlTree(['/flow/editor', flow.id], {
                queryParams: { mode: 'edit', editor: flow.type || 'flow', id: flow.id, ...(view === 'test' ? { view } : {}) },
              }),
        ),
        catchError(() => of(undefined)),
      );
    }
    if (kind === 'api') {
      return this.apiService.query(QUIET).pipe(
        map(apis => apis.find(api => api.name?.toLowerCase() === name.toLowerCase())),
        map(api => (api?.id === undefined ? undefined : this.router.createUrlTree(['/rest-apis', api.id]))),
        catchError(() => of(undefined)),
      );
    }
    return of(undefined);
  }

  /** Whether the user is on that page already, whatever its query, such as the Design or Test view of an editor. */
  isCurrent(url: UrlTree): boolean {
    return pathOf(this.router.parseUrl(this.router.url)) === pathOf(url);
  }
}

function pathOf(url: UrlTree): string {
  return '/' + (url.root.children['primary']?.segments.map(segment => segment.path).join('/') ?? '');
}
