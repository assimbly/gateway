import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthServerProvider } from 'app/core/auth';

import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthServerProvider, useValue: { getToken: () => 'jwt', isTokenExpired: () => false } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function authorizationOf(url: string): string | null {
    http.get(url).subscribe();
    return httpMock.expectOne(url).request.headers.get('Authorization');
  }

  it('sends the token to the own API', () => {
    expect(authorizationOf('api/flows')).toBe('Bearer jwt');
    expect(authorizationOf(`${location.origin}/api/flows`)).toBe('Bearer jwt');
  });

  it('never sends the token to another host', () => {
    expect(authorizationOf('https://example.org/api/flows')).toBeNull();
    expect(authorizationOf('//example.org/api/flows')).toBeNull();
  });

  it('sends no token to the public endpoints', () => {
    expect(authorizationOf('/api/authenticate')).toBeNull();
    expect(authorizationOf('i18n/en.json')).toBeNull();
  });
});
