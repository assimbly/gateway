import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth';

import { THEME_STORAGE_KEY } from './theme.model';
import { ThemeService } from './theme.service';

function stubMatchMedia(matches: boolean, listeners: Array<(event: MediaQueryListEvent) => void> = []): MediaQueryList {
  const mediaQuery = {
    matches,
    media: ThemeService.SYSTEM_MEDIA_QUERY,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.push(listener)),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      ...mediaQuery,
      media: query,
      matches: query.includes('prefers-color-scheme: dark') ? matches : false,
      addEventListener: mediaQuery.addEventListener,
      removeEventListener: mediaQuery.removeEventListener,
    }),
  });

  return mediaQuery;
}

function setSystemDark(matches: boolean): ReturnType<typeof stubMatchMedia> {
  return stubMatchMedia(matches);
}

describe('ThemeService', () => {
  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-bs-theme');
    document.documentElement.removeAttribute('data-theme-preference');
    document.documentElement.style.backgroundColor = '';
    TestBed.resetTestingModule();
  });

  describe('resolution', () => {
    beforeEach(() => {
      localStorage.removeItem(THEME_STORAGE_KEY);
    });

    it('defaults to SYSTEM and follows prefers-color-scheme', () => {
      setSystemDark(true);
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ThemeService);

      expect(service.preference()).toBe('SYSTEM');
      expect(service.appearance()).toBe('dark');
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme-preference')).toBe('SYSTEM');
    });

    it('uses LIGHT regardless of the operating system preference', () => {
      setSystemDark(true);
      localStorage.setItem(THEME_STORAGE_KEY, 'LIGHT');
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ThemeService);

      expect(service.preference()).toBe('LIGHT');
      expect(service.appearance()).toBe('light');
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    });

    it('uses DARK regardless of the operating system preference', () => {
      setSystemDark(false);
      localStorage.setItem(THEME_STORAGE_KEY, 'DARK');
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ThemeService);

      expect(service.preference()).toBe('DARK');
      expect(service.appearance()).toBe('dark');
    });

    it('treats an unknown cached value as SYSTEM', () => {
      setSystemDark(false);
      localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ThemeService);

      expect(service.preference()).toBe('SYSTEM');
      expect(service.appearance()).toBe('light');
    });
  });

  describe('setPreference', () => {
    it('applies immediately, caches the value, and persists when authenticated', () => {
      setSystemDark(false);
      const save = vi.fn(() => of({}));
      const authenticate = vi.fn();
      const account = {
        activated: true,
        authorities: [],
        email: 'user@localhost',
        firstName: 'User',
        langKey: 'en',
        lastName: 'User',
        login: 'user',
        imageUrl: '',
        themePreference: 'SYSTEM' as const,
      };

      TestBed.configureTestingModule({
        providers: [
          {
            provide: AccountService,
            useValue: {
              account: () => account,
              save,
              authenticate,
            },
          },
        ],
      });
      const service = TestBed.inject(ThemeService);

      service.setPreference('DARK');

      expect(service.preference()).toBe('DARK');
      expect(service.appearance()).toBe('dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('DARK');
      expect(save).toHaveBeenCalledWith({ ...account, themePreference: 'DARK' });
      expect(authenticate).toHaveBeenCalledWith({ ...account, themePreference: 'DARK' });
    });

    it('does not persist when the user is not authenticated', () => {
      setSystemDark(false);
      const save = vi.fn(() => of({}));
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AccountService,
            useValue: {
              account: () => null,
              save,
              authenticate: vi.fn(),
            },
          },
        ],
      });
      const service = TestBed.inject(ThemeService);

      service.setPreference('LIGHT');

      expect(service.appearance()).toBe('light');
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe('system preference changes', () => {
    it('updates appearance for SYSTEM and ignores OS changes when LIGHT is selected', () => {
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      stubMatchMedia(false, listeners);
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AccountService,
            useValue: {
              account: () => null,
              save: vi.fn(),
              authenticate: vi.fn(),
            },
          },
        ],
      });
      const service = TestBed.inject(ThemeService);

      expect(service.appearance()).toBe('light');
      listeners.forEach(listener => listener({ matches: true } as MediaQueryListEvent));
      expect(service.appearance()).toBe('dark');

      service.setPreference('LIGHT');
      listeners.forEach(listener => listener({ matches: true } as MediaQueryListEvent));
      expect(service.appearance()).toBe('light');
    });
  });

  describe('syncFromAccount', () => {
    it('applies the account preference without posting', () => {
      setSystemDark(false);
      const save = vi.fn(() => of({}));
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AccountService,
            useValue: {
              account: () => null,
              save,
              authenticate: vi.fn(),
            },
          },
        ],
      });
      const service = TestBed.inject(ThemeService);

      service.syncFromAccount({
        activated: true,
        authorities: [],
        email: '',
        firstName: '',
        langKey: 'en',
        lastName: '',
        login: 'user',
        imageUrl: '',
        themePreference: 'DARK',
      });

      expect(service.preference()).toBe('DARK');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('DARK');
      expect(save).not.toHaveBeenCalled();
    });
  });
});
