import { HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';

import { serverApiUrl } from 'app/config';
import { AuthServerProvider } from 'app/core/auth';

function isPublicUnauthenticatedUrl(url: string): boolean {
  return (
    url.includes('/i18n/') ||
    url.includes('i18n/') ||
    url.includes('/management/info') ||
    url.includes('/api/authenticate')
  );
}

/** Whether the request goes to the app's own host or its API server: no other host may receive the token. */
function isOwnUrl(url: string): boolean {
  const { origin } = new URL(url, document.baseURI);
  return origin === location.origin || origin === new URL(serverApiUrl, document.baseURI).origin;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServerProvider = inject(AuthServerProvider);
  let token = authServerProvider.getToken();

  // Drop expired JWTs: oauth2ResourceServer rejects them even on permitAll paths.
  if (token && authServerProvider.isTokenExpired(token)) {
    authServerProvider.clearToken();
    token = null;
  }

  // Do not send Bearer on public static/auth endpoints.
  if (token && isOwnUrl(req.url) && !isPublicUnauthenticatedUrl(req.url)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
