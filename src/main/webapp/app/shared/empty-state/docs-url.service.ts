import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { serverApiUrl } from 'app/config';

/** The address of the documentation, as the Gateway is configured with it. It stays empty when it is not known. */
@Service()
export class DocsUrlService {
  private readonly http = inject(HttpClient);
  private readonly urlState = signal('');
  private requested = false;

  readonly url = this.urlState.asReadonly();

  /** Asks for the address, once. */
  load(): void {
    if (this.requested) {
      return;
    }
    this.requested = true;
    this.http.get(`${serverApiUrl}api/wiki-url`, { responseType: 'text' }).subscribe({
      next: url => this.urlState.set(url.trim()),
      error: () => this.urlState.set(''),
    });
  }
}
