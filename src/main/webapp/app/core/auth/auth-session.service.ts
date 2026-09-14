import { HttpClient } from '@angular/common/http';
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

  /** JWT logout is client-side only (no server session to invalidate). */
  logout(): Observable<void> {
    return new Observable(observer => {
      this.clearToken();
      observer.complete();
    });
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

  isTokenExpired(token: string | null = this.getToken()): boolean {
    if (!token) {
      return true;
    }
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(normalized)) as { exp?: number };
      if (!payload.exp) {
        return true;
      }
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
