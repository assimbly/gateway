import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Navigation, Router } from '@angular/router';

import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { AccountService } from 'app/core/auth';
import { ProfileService } from 'app/layouts/profiles/profile.service';

import Login from './login';
import { LoginService } from './login.service';

describe('Login', () => {
  let comp: Login;
  let fixture: ComponentFixture<Login>;
  let mockRouter: Router;
  let mockAccountService: AccountService;
  let mockLoginService: LoginService;
  let registration = false;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: AccountService,
          useValue: {
            isAuthenticated: vi.fn(),
          },
        },
        {
          provide: LoginService,
          useValue: {
            login: vi.fn(() => of({})),
          },
        },
        {
          provide: ProfileService,
          useValue: {
            getProfileInfo: vi.fn(() => of({ registration })),
          },
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Login);
    comp = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    vi.spyOn(mockRouter, 'navigate');
    mockLoginService = TestBed.inject(LoginService);
    mockAccountService = TestBed.inject(AccountService);
  });

  describe('ngOnInit', () => {
    it('should call accountService.identity on Init', () => {
      // GIVEN
      mockAccountService.identity = vi.fn(() => of(null));

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(mockAccountService.identity).toHaveBeenCalled();
    });

    it('should call accountService.isAuthenticated on Init', () => {
      // GIVEN
      mockAccountService.identity = vi.fn(() => of(null));

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(mockAccountService.isAuthenticated).toHaveBeenCalled();
    });

    it('should navigate to home page on Init if authenticated=true', () => {
      // GIVEN
      mockAccountService.identity = vi.fn(() => of(null));
      mockAccountService.isAuthenticated = () => true;

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('registration', () => {
    it('offers no account of your own when an administrator adds users', () => {
      expect(comp.registration()).toBe(false);
    });

    it('offers to register when the Gateway lets anyone create an account', () => {
      registration = true;
      const open = TestBed.createComponent(Login).componentInstance;
      registration = false;

      expect(open.registration()).toBe(true);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should set focus to username input after the view has been initialized', () => {
      // GIVEN
      const node = {
        focus: vi.fn(),
      };
      vi.spyOn(comp, 'username').mockReturnValue(new ElementRef(node));

      // WHEN
      comp.ngAfterViewInit();

      // THEN
      expect(node.focus).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate the user and navigate to home page', () => {
      // GIVEN
      const credentials = {
        username: 'admin',
        password: 'admin',
        rememberMe: true,
      };

      comp.loginForm.patchValue({
        username: 'admin',
        password: 'admin',
        rememberMe: true,
      });

      // WHEN
      comp.login();

      // THEN
      expect(comp.authenticationError()).toEqual(false);
      expect(mockLoginService.login).toHaveBeenCalledWith(credentials);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
    });

    it('should authenticate the user but not navigate to home page if authentication process is already routing to cached url from localstorage', () => {
      // GIVEN
      vi.spyOn(mockRouter, 'currentNavigation').mockReturnValue({} as Navigation);

      // WHEN
      comp.login();

      // THEN
      expect(comp.authenticationError()).toEqual(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should stay on login form and show error message on login error', () => {
      // GIVEN
      mockLoginService.login = vi.fn(() => throwError(Error));

      // WHEN
      comp.login();

      // THEN
      expect(comp.authenticationError()).toEqual(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
