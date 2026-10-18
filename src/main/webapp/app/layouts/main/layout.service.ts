import { DestroyRef, Service, WritableSignal, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';

export type MenuGroup = 'flows' | 'broker' | 'api' | 'admin' | 'account';
const MENU_GROUPS: readonly MenuGroup[] = ['flows', 'broker', 'api', 'admin', 'account'];

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
  readonly apiExpanded = signal(false);
  readonly adminExpanded = signal(false);
  readonly accountExpanded = signal(false);
  private menuExpansionInitialized = false;
  private activeGroup: MenuGroup | undefined;

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

  syncMenuExpansion(active: Record<MenuGroup, boolean>): void {
    if (!this.menuExpansionInitialized) {
      this.flowsExpanded.set(active.flows);
      this.brokerExpanded.set(active.broker);
      this.apiExpanded.set(active.api);
      this.adminExpanded.set(active.admin);
      this.accountExpanded.set(active.account);
      this.activeGroup = MENU_GROUPS.find(name => active[name]);
      this.menuExpansionInitialized = true;
      return;
    }
    // Only react when the route moves to another group, so a manually chosen group survives navigation within a group.
    const group = MENU_GROUPS.find(name => active[name]);
    if (group && group !== this.activeGroup) {
      this.openMenu(group);
    }
    this.activeGroup = group;
  }

  /** Accordion: opening a group collapses the others; toggling the open group closes it. */
  toggleMenu(group: MenuGroup): void {
    if (this.menuSignal(group)()) {
      this.menuSignal(group).set(false);
      return;
    }
    this.openMenu(group);
  }

  openMenu(group: MenuGroup): void {
    for (const name of MENU_GROUPS) {
      this.menuSignal(name).set(name === group);
    }
  }

  private menuSignal(group: MenuGroup): WritableSignal<boolean> {
    switch (group) {
      case 'flows':
        return this.flowsExpanded;
      case 'broker':
        return this.brokerExpanded;
      case 'api':
        return this.apiExpanded;
      case 'admin':
        return this.adminExpanded;
      default:
        return this.accountExpanded;
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
