import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';

import { inject } from '@angular/core';

import { tap } from 'rxjs';

import { AuthServerProvider } from 'app/core/auth';
import { agentDebugLog } from 'app/core/util/agent-debug-log';

function isPublicUnauthenticatedUrl(url: string): boolean {
  return (
    url.includes('/i18n/') ||
    url.includes('i18n/') ||
    url.includes('/management/info') ||
    url.includes('/api/authenticate')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServerProvider = inject(AuthServerProvider);
  let token = authServerProvider.getToken();
  const isI18n = req.url.includes('/i18n/') || req.url.includes('i18n/');
  const isManagementInfo = req.url.includes('/management/info');
  const isLogout = req.url.includes('/api/logout');
  const isPublic = isPublicUnauthenticatedUrl(req.url);
  const wasExpired = !!token && authServerProvider.isTokenExpired(token);

  if (wasExpired) {
    authServerProvider.clearToken();
    token = null;
  }

  // #region agent log
  if (isI18n || isManagementInfo || isLogout || wasExpired || req.url.includes('/api/authenticate')) {
    agentDebugLog({
      runId: 'post-fix',
      hypothesisId: 'A',
      location: 'auth-interceptor.ts:entry',
      message: 'auth interceptor request',
      data: {
        url: req.url,
        hasToken: !!token,
        tokenLength: token?.length ?? 0,
        wasExpired,
        isPublic,
        attachingAuth: !!(token && !isPublic),
        isI18n,
      },
    });
  }
  // #endregion

  // Do not send Bearer on public static/auth endpoints: oauth2ResourceServer
  // rejects expired/invalid JWTs even when the path is permitAll.
  if (token && !isPublic) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    tap({
      next: event => {
        // #region agent log
        if ((isI18n || isManagementInfo) && event instanceof HttpResponse) {
          agentDebugLog({
            runId: 'post-fix',
            hypothesisId: 'A',
            location: 'auth-interceptor.ts:response',
            message: 'auth interceptor response ok',
            data: { url: req.url, status: event.status, isI18n, attachingAuth: !!(token && !isPublic) },
          });
        }
        // #endregion
      },
      error: err => {
        // #region agent log
        if (isI18n || isManagementInfo || isLogout) {
          agentDebugLog({
            runId: 'post-fix',
            hypothesisId: 'A',
            location: 'auth-interceptor.ts:error',
            message: 'auth interceptor response error',
            data: {
              url: req.url,
              status: err.status,
              hasToken: !!token,
              isI18n,
              message: err.message,
            },
          });
        }
        // #endregion
      },
    }),
  );
};
