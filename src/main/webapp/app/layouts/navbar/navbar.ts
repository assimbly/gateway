import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, OnInit, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap/dropdown';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';
import { TranslateService } from '@ngx-translate/core';

import { filter, map, startWith } from 'rxjs';

import { LANGUAGES } from 'app/config';
import { AccountService, StateStorageService } from 'app/core/auth';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { LoginService } from 'app/login/login.service';
import { HasAnyAuthorityDirective } from 'app/shared/auth';
import { TranslateDirective } from 'app/shared/language';
import ThemeSelector from 'app/shared/theme/theme-selector';
import { LayoutService } from 'app/layouts/main/layout.service';
import { ThemeService } from 'app/core/theme';

import { environment } from 'environments/environment';

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    FontAwesomeModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbTooltip,
    HasAnyAuthorityDirective,
    TranslateDirective,
    ThemeSelector,
  ],
  host: {
    id: 'app-sidebar',
    class: 'app-sidebar',
    '[class.app-sidebar--visible]': 'sidebarVisible()',
    '[class.app-sidebar--collapsed]': 'layout.iconOnly()',
    '[class.app-sidebar--mobile-open]': 'layout.mobileOpen()',
    '[attr.aria-hidden]': 'sidebarVisible() ? null : "true"',
    '[inert]': 'sidebarInert()',
  },
})
export default class Navbar implements OnInit {
  readonly inProduction = signal(true);
  readonly languages = LANGUAGES;
  readonly openAPIEnabled = signal(false);
  readonly account = inject(AccountService).account;
  readonly type = environment.TYPE;
  readonly layout = inject(LayoutService);
  private readonly theme = inject(ThemeService);
  readonly brandIcon = computed(() => (this.theme.appearance() === 'dark' ? 'logo_darkmode.svg' : 'logo_lightmode.svg'));
  readonly sidebarVisible = computed(() => this.account() !== null);
  readonly sidebarInert = computed(() => !this.sidebarVisible() || (!this.layout.isDesktop() && !this.layout.mobileOpen()));

  private readonly loginService = inject(LoginService);
  private readonly translateService = inject(TranslateService);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly sidebarClose = viewChild<ElementRef<HTMLButtonElement>>('sidebarClose');
  private mobileWasOpen = false;

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly flowsExpanded = computed(() => this.layout.flowsExpanded());
  readonly brokerExpanded = computed(() => this.layout.brokerExpanded());
  readonly adminExpanded = computed(() => this.layout.adminExpanded());
  readonly accountExpanded = computed(() => this.layout.accountExpanded());

  constructor() {
    this.syncMenuExpansion(this.router.url);

    effect(() => {
      const url = this.currentUrl();
      untracked(() => this.syncMenuExpansion(url));
    });

    effect(() => {
      const open = this.layout.mobileOpen();
      if (open && !this.mobileWasOpen) {
        queueMicrotask(() => this.sidebarClose()?.nativeElement.focus());
      }
      this.mobileWasOpen = open;
    });
  }

  ngOnInit(): void {
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction.set(profileInfo.inProduction ?? true);
      this.openAPIEnabled.set(profileInfo.openAPIEnabled ?? false);
    });
  }

  brandTitle(): string {
    const title = this.translateService.instant('global.title');
    return typeof title === 'string' && title.length > 0 ? title : 'Gateway';
  }

  isFlowsActive(): boolean {
    return this.isFlowsPath(this.currentUrl());
  }

  /** The Flows list, and every page of a single Flow such as its editor. */
  isFlowListActive(): boolean {
    const path = this.currentPath();
    return path === '/' || (path.startsWith('/flow') && !this.isActivePath('/flow/message-sender'));
  }

  isActivePath(path: string, exact = false): boolean {
    const current = this.currentPath();
    if (exact) {
      return current === path;
    }
    return current === path || current.startsWith(`${path}/`);
  }

  /** The brokers list and its detail pages, but not the pages reached from Send or Endpoints. */
  isBrokerManageActive(): boolean {
    return this.isActivePath('/broker') && !this.isBrokerSendActive() && !this.isActivePath('/broker/browser');
  }

  isBrokerSendActive(): boolean {
    return this.isActivePath('/broker/sender');
  }

  /** Queues and topics, plus the message browser which is opened from an endpoint row. */
  isEndpointsActive(): boolean {
    return this.isActivePath('/queue') || this.isActivePath('/topic') || this.isActivePath('/broker/browser');
  }

  isBrokerActive(): boolean {
    return this.isBrokerPath(this.currentUrl());
  }

  isAdminActive(): boolean {
    return this.isAdminPath(this.currentUrl());
  }

  isAccountActive(): boolean {
    return this.isAccountPath(this.currentUrl());
  }

  toggleFlows(): void {
    this.layout.flowsExpanded.update(open => !open);
  }

  toggleBroker(): void {
    this.layout.brokerExpanded.update(open => !open);
  }

  toggleAdmin(): void {
    this.layout.adminExpanded.update(open => !open);
  }

  toggleAccount(): void {
    this.layout.accountExpanded.update(open => !open);
  }

  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  collapseNavbar(): void {
    this.layout.closeMobile();
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  private syncMenuExpansion(url: string): void {
    this.layout.syncMenuExpansion({
      flows: this.isFlowsPath(url),
      broker: this.isBrokerPath(url),
      admin: this.isAdminPath(url),
      account: this.isAccountPath(url),
    });
  }

  private currentPath(): string {
    return this.currentUrl().split('?')[0];
  }

  private isFlowsPath(url: string): boolean {
    const path = url.split('?')[0];
    return path === '/' || path.startsWith('/flow') || path.startsWith('/environment-variables');
  }

  private isBrokerPath(url: string): boolean {
    const path = url.split('?')[0];
    return path === '/broker' || path.startsWith('/broker/') || path.startsWith('/queue') || path.startsWith('/topic');
  }

  private isAdminPath(url: string): boolean {
    return (
      url.startsWith('/admin') ||
      url.startsWith('/user-management') ||
      url.startsWith('/integration') ||
      url.startsWith('/certificate')
    );
  }

  private isAccountPath(url: string): boolean {
    const path = url.split('?')[0];
    return path.startsWith('/account/settings') || path.startsWith('/account/password') || path.startsWith('/account/register');
  }
}
