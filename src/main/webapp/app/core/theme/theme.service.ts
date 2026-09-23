import { DestroyRef, DOCUMENT, Injector, Service, computed, inject, signal } from '@angular/core';

import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';

import {
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  ThemeAppearance,
  ThemePreference,
  parseThemePreference,
  resolveThemeAppearance,
} from './theme.model';

@Service()
export class ThemeService {
  static readonly STORAGE_KEY = THEME_STORAGE_KEY;
  static readonly SYSTEM_MEDIA_QUERY = '(prefers-color-scheme: dark)';
  static readonly LIGHT_THEME_COLOR = '#F6F7F9';
  static readonly DARK_THEME_COLOR = '#181A1D';

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly preferenceState = signal<ThemePreference>(this.readCachedPreference());
  private readonly systemDarkState = signal(this.readSystemDark());
  private readonly mediaQuery = this.getMediaQuery();

  readonly preference = this.preferenceState.asReadonly();
  readonly appearance = computed(() => resolveThemeAppearance(this.preferenceState(), this.systemDarkState()));
  readonly editorTheme = computed(() => (this.appearance() === 'dark' ? 'material-darker' : 'default'));

  constructor() {
    this.applyToDocument();

    const destroyRef = inject(DestroyRef);
    const onMediaChange = (event: MediaQueryListEvent): void => {
      this.systemDarkState.set(event.matches);
      if (this.preferenceState() === 'SYSTEM') {
        this.applyToDocument();
      }
    };
    this.mediaQuery?.addEventListener('change', onMediaChange);
    destroyRef.onDestroy(() => this.mediaQuery?.removeEventListener('change', onMediaChange));
  }

  setPreference(preference: ThemePreference): void {
    const next = parseThemePreference(preference);
    const changed = this.preferenceState() !== next;
    this.applyPreference(next);
    if (changed) {
      this.persistPreference(next);
    }
  }

  syncFromAccount(account: Account | null): void {
    if (!account) {
      return;
    }
    this.applyPreference(parseThemePreference(account.themePreference));
  }

  private applyPreference(preference: ThemePreference): void {
    this.preferenceState.set(preference);
    this.writeCachedPreference(preference);
    this.applyToDocument();
  }

  private applyToDocument(): void {
    const appearance = this.appearance();
    const root = this.document.documentElement;
    root.setAttribute('data-bs-theme', appearance);
    root.setAttribute('data-theme-preference', this.preferenceState());
    root.style.backgroundColor = appearance === 'dark' ? ThemeService.DARK_THEME_COLOR : ThemeService.LIGHT_THEME_COLOR;

    const themeColor = this.document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', appearance === 'dark' ? ThemeService.DARK_THEME_COLOR : ThemeService.LIGHT_THEME_COLOR);
  }

  private persistPreference(preference: ThemePreference): void {
    const accountService = this.injector.get(AccountService);
    const account = accountService?.account();
    if (!accountService || !account) {
      return;
    }
    const updated = { ...account, themePreference: preference };
    accountService.save(updated).subscribe({
      next: () => accountService.authenticate(updated),
      error: () => {
        // Keep the applied appearance; the next identity() will resync from the server.
      },
    });
  }

  private readCachedPreference(): ThemePreference {
    try {
      return parseThemePreference(localStorage.getItem(ThemeService.STORAGE_KEY));
    } catch {
      return DEFAULT_THEME_PREFERENCE;
    }
  }

  private writeCachedPreference(preference: ThemePreference): void {
    try {
      localStorage.setItem(ThemeService.STORAGE_KEY, preference);
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  private readSystemDark(): boolean {
    return this.getMediaQuery()?.matches ?? false;
  }

  private getMediaQuery(): MediaQueryList | undefined {
    const view = this.document.defaultView;
    if (!view?.matchMedia) {
      return undefined;
    }
    return view.matchMedia(ThemeService.SYSTEM_MEDIA_QUERY);
  }
}

export type { ThemeAppearance, ThemePreference };
