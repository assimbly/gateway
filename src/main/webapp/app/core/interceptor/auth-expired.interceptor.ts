import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';

import { StateStorageService } from 'app/core/auth';
import { LoginService } from 'app/login/login.service';

export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const stateStorageService = inject(StateStorageService);
  const router = inject(Router);

  return next(req).pipe(
    tap({
      error(err: HttpErrorResponse) {
        // A 401 from api/authenticate means wrong credentials, not an expired session: the login form shows that itself
        if (err.status === 401 && err.url && !err.url.includes('api/account') && !err.url.includes('api/authenticate')) {
          if (err.url.includes(loginService.logoutUrl())) {
            loginService.logoutInClient();
            return;
          }
          stateStorageService.storeUrl(router.routerState.snapshot.url);
          // Clear expired JWT immediately (client-side); do not depend on /api/logout.
          loginService.logoutInClient();
          router.navigate(['/login']);
        }
      },
    }),
  );
};
