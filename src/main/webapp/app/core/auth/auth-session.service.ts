import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { serverApiUrl } from 'app/config';

import { Login } from './login.model';

@Service()
export class AuthServerProvider {
  private readonly http = inject(HttpClient);

  login(credentials: Login): Observable<{}> {
    const data =
      `username=${encodeURIComponent(credentials.username)}` +
      `&password=${encodeURIComponent(credentials.password)}` +
      `&remember-me=${credentials.rememberMe ? 'true' : 'false'}` +
      '&submit=Login';

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(`${serverApiUrl}api/authentication`, data, { headers });
  }

  logout(): Observable<void> {
    // logout from the server
    return this.http.post(`${serverApiUrl}api/logout`, {}).pipe(
      map(() => {
        // to get a new csrf token call the api
        this.http.get(`${serverApiUrl}api/account`).subscribe({
          error() {
            // Handled by interceptor
          },
        });
      }),
    );
  }
}
