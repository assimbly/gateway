import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { tap } from 'rxjs';

import { EventManager, EventWithContent } from 'app/core/util';

/** Set on a request whose caller shows its errors itself, so they don't also appear in the page's error alert. */
export const HANDLES_OWN_ERRORS = new HttpContextToken<boolean>(() => false);

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const eventManager = inject(EventManager);

  return next(req).pipe(
    tap({
      error(err: HttpErrorResponse) {
        if (req.context.get(HANDLES_OWN_ERRORS)) {
          return;
        }
        if (!(err.status === 401 && (err.message === '' || err.url?.includes('api/account')))) {
          eventManager.broadcast(new EventWithContent('jhipsterGradleSampleApplicationApp.httpError', err));
        }
      },
    }),
  );
};
