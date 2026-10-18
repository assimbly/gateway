import { Component, inject } from '@angular/core';

import { AuthServerProvider } from 'app/core/auth';

@Component({
  selector: 'jhi-docs',
  templateUrl: './docs.html',
  styleUrl: './docs.scss',
})
export default class Docs {
  private readonly authServerProvider = inject(AuthServerProvider);

  /**
   * Swagger UI does not know the login of the app: its Try it out calls get the token of the app, like the
   * authInterceptor adds it. Swagger UI rebuilds its configuration (and drops its authorization) after loading
   * and on switching the definition, so the token is added to the requests of the frame instead.
   */
  addToken(frame: HTMLIFrameElement): void {
    const swaggerWindow = frame.contentWindow;
    if (!swaggerWindow) {
      return;
    }
    const fetch = swaggerWindow.fetch.bind(swaggerWindow);
    swaggerWindow.fetch = (input, init) => {
      const token = this.authServerProvider.getToken();
      const url = new URL(input instanceof Request ? input.url : String(input), swaggerWindow.location.href);
      const headers = new Headers(init?.headers);
      if (
        !token ||
        this.authServerProvider.isTokenExpired(token) ||
        url.origin !== swaggerWindow.location.origin ||
        headers.has('Authorization')
      ) {
        return fetch(input, init);
      }
      headers.set('Authorization', `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    };
  }
}
