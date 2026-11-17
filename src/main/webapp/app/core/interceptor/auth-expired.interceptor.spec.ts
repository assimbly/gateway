import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginService } from 'app/login/login.service';

import { authExpiredInterceptor } from './auth-expired.interceptor';

describe('authExpiredInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let router: Router;
    const loginService = { logoutUrl: () => 'api/logout', logoutInClient: jest.fn() };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authExpiredInterceptor])),
                provideHttpClientTesting(),
                { provide: LoginService, useValue: loginService },
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        jest.spyOn(router, 'navigate').mockResolvedValue(true);
        loginService.logoutInClient.mockClear();
    });

    afterEach(() => httpMock.verify());

    const failWith401 = (url: string) => {
        http.get(url).subscribe({ error: () => undefined });
        httpMock.expectOne(url).flush(null, { status: 401, statusText: 'Unauthorized' });
    };

    it('sends the user to the login page when the session has expired', () => {
        failWith401('api/flows');

        expect(loginService.logoutInClient).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('leaves wrong credentials to the login form', () => {
        failWith401('api/authenticate');

        expect(loginService.logoutInClient).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
