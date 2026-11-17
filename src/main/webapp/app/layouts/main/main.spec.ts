import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DOCUMENT } from '@angular/common';
import { Component, signal } from '@angular/core';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';

import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import Main from './main';

describe('Main', () => {
  let comp: Main;
  let fixture: ComponentFixture<Main>;
  let mockAccountService: AccountService;
  let router: Router;
  let document: Document;

  beforeEach(waitForAsync(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, Main],
      providers: [
        Title,
        { provide: AccountService, useValue: { identity: jest.fn(() => of(null)), account: signal(null), isAuthenticated: () => false } },
        { provide: TitleStrategy, useClass: AppPageTitleStrategy },
      ],
    })
      .overrideTemplate(Main, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Main);
    comp = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService);
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
  });

  it('should try to log in on init', () => {
    comp.ngOnInit();

    expect(mockAccountService.identity).toHaveBeenCalled();
  });

  it('names the page in the browser tab on navigation', fakeAsync(() => {
    router.resetConfig([
      { path: '', title: 'Flows', component: BlankComponent },
      { path: 'untitled', component: BlankComponent },
    ]);

    router.navigateByUrl('');
    tick();
    expect(document.title).toBe('Flows - Assimbly');

    router.navigateByUrl('/untitled');
    tick();
    expect(document.title).toBe('Assimbly');
  }));
});

@Component({ template: '' })
export class BlankComponent {}
