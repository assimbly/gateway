import { DestroyRef, Service, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';

@Service()
export class LayoutService {
  static readonly STORAGE_KEY = 'jhi-sidebar-collapsed';
  static readonly DESKTOP_MEDIA_QUERY = '(min-width: 992px)';

  private readonly document = inject(DOCUMENT);
  private readonly collapsedState = signal(this.readCollapsed());
  private readonly desktopState = signal(this.readIsDesktop());
  private readonly mobileOpenState = signal(false);
  private readonly hamburgerFocusRequestedState = signal(false);
  private readonly mediaQuery = this.getMediaQuery();

  readonly collapsed = this.collapsedState.asReadonly();
  readonly isDesktop = this.desktopState.asReadonly();
  readonly mobileOpen = this.mobileOpenState.asReadonly();
  readonly hamburgerFocusRequested = this.hamburgerFocusRequestedState.asReadonly();
  readonly iconOnly = computed(() => this.isDesktop() && this.collapsed());
  readonly flowsExpanded = signal(false);
  readonly brokerExpanded = signal(false);
  readonly adminExpanded = signal(false);
  readonly accountExpanded = signal(false);
  private menuExpansionInitialized = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const router = inject(Router);

    const onMediaChange = (event: MediaQueryListEvent): void => {
      this.desktopState.set(event.matches);
      if (event.matches) {
        this.closeMobile();
      }
    };
    this.mediaQuery?.addEventListener('change', onMediaChange);

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && this.mobileOpen()) {
        event.preventDefault();
        this.closeMobile();
      }
    };
    this.document.addEventListener('keydown', onKeydown);

    const routerSub = router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => this.closeMobile());

    destroyRef.onDestroy(() => {
      this.mediaQuery?.removeEventListener('change', onMediaChange);
      this.document.removeEventListener('keydown', onKeydown);
      routerSub.unsubscribe();
    });
  }

  toggleCollapsed(): void {
    const next = !this.collapsedState();
    this.collapsedState.set(next);
    this.persistCollapsed(next);
  }

  toggleMobile(): void {
    if (this.mobileOpenState()) {
      this.closeMobile();
      return;
    }
    this.mobileOpenState.set(true);
  }

  closeMobile(): void {
    if (!this.mobileOpenState()) {
      return;
    }
    this.mobileOpenState.set(false);
    this.hamburgerFocusRequestedState.set(true);
  }

  consumeHamburgerFocus(): void {
    this.hamburgerFocusRequestedState.set(false);
  }

  syncMenuExpansion(active: { flows: boolean; broker: boolean; admin: boolean; account: boolean }): void {
    if (!this.menuExpansionInitialized) {
      this.flowsExpanded.set(active.flows);
      this.brokerExpanded.set(active.broker);
      this.adminExpanded.set(active.admin);
      this.accountExpanded.set(active.account);
      this.menuExpansionInitialized = true;
      return;
    }
    if (active.flows) {
      this.flowsExpanded.set(true);
    }
    if (active.broker) {
      this.brokerExpanded.set(true);
    }
    if (active.admin) {
      this.adminExpanded.set(true);
    }
    if (active.account) {
      this.accountExpanded.set(true);
    }
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(LayoutService.STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private persistCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(LayoutService.STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  private readIsDesktop(): boolean {
    return this.getMediaQuery()?.matches ?? true;
  }

  private getMediaQuery(): MediaQueryList | undefined {
    const view = this.document.defaultView;
    if (!view?.matchMedia) {
      return undefined;
    }
    return view.matchMedia(LayoutService.DESKTOP_MEDIA_QUERY);
  }
}
