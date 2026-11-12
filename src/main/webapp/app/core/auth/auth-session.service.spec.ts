import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthServerProvider } from './auth-session.service';

describe('AuthServerProvider token storage', () => {
  const KEY = 'authenticationToken';
  let service: AuthServerProvider;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthServerProvider);
    httpMock = TestBed.inject(HttpTestingController);
  });

  function login(rememberMe: boolean): void {
    service.login({ username: 'admin', password: 'secret', rememberMe }).subscribe();
    httpMock.expectOne('api/authenticate').flush({ id_token: 'jwt' });
  }

  it('keeps the token for the browser tab only when the user is not remembered', () => {
    login(false);

    expect(sessionStorage.getItem(KEY)).toBe('jwt');
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(service.getToken()).toBe('jwt');
  });

  it('keeps the token across browser sessions when the user is remembered', () => {
    login(true);

    expect(localStorage.getItem(KEY)).toBe('jwt');
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(service.getToken()).toBe('jwt');
  });

  it('clears the token from both stores', () => {
    login(true);
    sessionStorage.setItem(KEY, 'older');

    service.clearToken();

    expect(service.getToken()).toBeNull();
  });
});
