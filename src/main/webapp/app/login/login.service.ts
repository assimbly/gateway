import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { Observable, catchError, mergeMap, of } from 'rxjs';

import { serverApiUrl } from 'app/config';
import { Account, AccountService, AuthServerProvider, Login } from 'app/core/auth';

@Service()
export class LoginService {
  private readonly accountService = inject(AccountService);
  private readonly authServerProvider = inject(AuthServerProvider);
  private readonly http = inject(HttpClient);

  login(credentials: Login): Observable<Account | null> {
    return this.authServerProvider.login(credentials).pipe(mergeMap(() => this.accountService.identity(true)));
  }

  /** Whether to tell a first-time user on this computer to sign in with admin / admin (while that is still its password). */
  firstSignIn(): Observable<boolean> {
    return this.http.get<boolean>(`${serverApiUrl}api/account/first-sign-in`).pipe(catchError(() => of(false)));
  }

  logoutUrl(): string {
    return `${serverApiUrl}api/logout`;
  }

  logoutInClient(): void {
    this.authServerProvider.clearToken();
    this.accountService.authenticate(null);
  }

  logout(): void {
    this.authServerProvider.logout().subscribe({ complete: () => this.accountService.authenticate(null) });
  }
}
