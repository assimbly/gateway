import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { serverApiUrl } from 'app/config';

import { Login } from './login.model';

@Service()
export class AuthServerProvider {

  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'authenticationToken';

  login(credentials: Login): Observable<{ id_token: string }> {
    return this.http
      .post<{ id_token: string }>(`${serverApiUrl}api/authenticate`, {
        username: credentials.username,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      })
      .pipe(
        map(response => {
          this.setToken(response.id_token);
          return response;
        }),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${serverApiUrl}api/logout`, {}).pipe(
      map(() => {
        this.clearToken();
        this.http.get(`${serverApiUrl}api/account`).subscribe({
          error() {},
        });
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

}
