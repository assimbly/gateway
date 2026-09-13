import { HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';

import { AuthServerProvider } from 'app/core/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServerProvider = inject(AuthServerProvider);
  const token = authServerProvider.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
