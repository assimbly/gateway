import { HttpClient } from '@angular/common/http';
import { Component, NgZone, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { catchError, map, of } from 'rxjs';

import { serverApiUrl } from 'app/config';
import { AuthServerProvider } from 'app/core/auth';

import { API_DEFINITIONS, API_EXPLORER_PATH } from './api-definitions';

interface SwaggerConfig {
  urls?: { url: string; name: string }[];
}

const SWAGGER_UI = 'swagger-ui/index.html';
const PRIMARY_NAME = 'urls.primaryName';

/**
 * The API Explorer: Swagger UI in a frame, on the definition of the route. The definition can be picked in the
 * sidebar (the route changes, the frame loads it) and in the dropdown of Swagger UI (the route follows, the frame
 * stays as it is).
 */
@Component({
  selector: 'jhi-docs',
  templateUrl: './docs.html',
  styleUrl: './docs.scss',
})
export default class Docs {
  /** Group id of the route, like `broker`. */
  readonly definition = input.required<string>();

  /** Swagger UI names of the definitions by group id, as served by springdoc. */
  readonly names = toSignal(
    inject(HttpClient)
      .get<SwaggerConfig>(`${serverApiUrl}v3/api-docs/swagger-config`)
      .pipe(
        map(config => new Map((config.urls ?? []).map(({ url, name }) => [url.substring(url.lastIndexOf('/') + 1), name]))),
        catchError(() => of(new Map<string, string>())),
      ),
  );
  readonly frameSrc = signal<SafeResourceUrl | undefined>(undefined);

  /** Group id of the definition the frame shows. */
  private readonly shown = signal<string | undefined>(undefined);
  private readonly authServerProvider = inject(AuthServerProvider);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  constructor() {
    effect(() => {
      const definition = this.definition();
      const names = this.names();
      if (names) {
        untracked(() => this.show(definition, names));
      }
    });
  }

  onLoad(frame: HTMLIFrameElement): void {
    this.addToken(frame);
    this.followSelection(frame);
  }

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

  /** Swagger UI writes the picked definition to the query of its own window, which the route then follows. */
  private followSelection(frame: HTMLIFrameElement): void {
    const swaggerWindow = frame.contentWindow;
    if (!swaggerWindow) {
      return;
    }
    const history = swaggerWindow.history;
    for (const method of ['pushState', 'replaceState'] as const) {
      const original = history[method].bind(history);
      history[method] = (data: unknown, unused: string, url?: string | URL | null) => {
        original(data, unused, url);
        this.zone.run(() => this.selected(new URLSearchParams(swaggerWindow.location.search).get(PRIMARY_NAME)));
      };
    }
  }

  private selected(name: string | null): void {
    const definition = [...(this.names() ?? [])].find(([, value]) => value === name)?.[0];
    if (definition && definition !== this.shown()) {
      this.shown.set(definition);
      this.router.navigate([API_EXPLORER_PATH, definition], { replaceUrl: true });
    }
  }

  private show(definition: string, names: Map<string, string>): void {
    if (names.size === 0) {
      // The groups are unknown, so Swagger UI picks its first definition.
      this.frameSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(SWAGGER_UI));
      return;
    }
    const name = names.get(definition);
    if (name === undefined) {
      const fallback = API_DEFINITIONS.find(({ id }) => names.has(id))?.id ?? names.keys().next().value!;
      this.router.navigate([API_EXPLORER_PATH, fallback], { replaceUrl: true });
      return;
    }
    if (definition !== this.shown()) {
      this.shown.set(definition);
      this.frameSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(`${SWAGGER_UI}?${PRIMARY_NAME}=${encodeURIComponent(name)}`));
    }
  }
}
