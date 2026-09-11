import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { serverApiUrl } from 'app/config';

import { Session } from './session.model';

@Service()
export class SessionsService {
  private readonly http = inject(HttpClient);

  private resourceUrl = `${serverApiUrl}api/account/sessions`;

  findAll(): Observable<Session[]> {
    return this.http.get<Session[]>(this.resourceUrl);
  }

  delete(series: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/${series}`);
  }
}
