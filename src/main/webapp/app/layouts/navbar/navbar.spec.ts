import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { Account, AccountService } from 'app/core/auth';
import { ThemeService } from 'app/core/theme';
import { LayoutService } from 'app/layouts/main/layout.service';
import { ProfileInfo } from 'app/layouts/profiles/profile-info.model';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { LoginService } from 'app/login/login.service';

import Navbar from './navbar';

function stubMatchMedia(matches = true): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

describe('Navbar Component', () => {
  let comp: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let accountService: AccountService;
  let profileService: ProfileService;
  let layoutService: LayoutService;
  const account: Account = {
    activated: true,
    authorities: [],
    email: '',
    firstName: 'John',
    langKey: '',
    lastName: 'Doe',
    login: 'john.doe',
    imageUrl: '',
    themePreference: 'SYSTEM',
  };

  beforeEach(() => {
    stubMatchMedia(true);
    localStorage.removeItem(LayoutService.STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideRouter([]), provideHttpClient(), provideHttpClientTesting(), LoginService],
    });
  });

  beforeEach(() => {
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(Navbar);
    comp = fixture.componentInstance;
    accountService = TestBed.inject(AccountService);
    profileService = TestBed.inject(ProfileService);
    layoutService = TestBed.inject(LayoutService);
  });

  it('should call profileService.getProfileInfo on init', () => {
    // GIVEN
    jest.spyOn(profileService, 'getProfileInfo').mockReturnValue(of(new ProfileInfo()));

    // WHEN
    comp.ngOnInit();

    // THEN
    expect(profileService.getProfileInfo).toHaveBeenCalled();
  });

  it('should hold current authenticated user in variable account', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(comp.account()).toBeNull();

    // WHEN
    accountService.authenticate(account);

    // THEN
    expect(comp.account()).toEqual(account);

    // WHEN
    accountService.authenticate(null);

    // THEN
    expect(comp.account()).toBeNull();
  });

  it('should hold current authenticated user in variable account if user is authenticated before page load', () => {
    // GIVEN
    accountService.authenticate(account);

    // WHEN
    comp.ngOnInit();

    // THEN
    expect(comp.account()).toEqual(account);

    // WHEN
    accountService.authenticate(null);

    // THEN
    expect(comp.account()).toBeNull();
  });

  it('should close the mobile overlay when collapseNavbar is called', () => {
    layoutService.toggleMobile();
    expect(layoutService.mobileOpen()).toBe(true);

    comp.collapseNavbar();

    expect(layoutService.mobileOpen()).toBe(false);
  });

  it('should show the sidebar only when authenticated', () => {
    expect(comp.sidebarVisible()).toBe(false);

    accountService.authenticate(account);

    expect(comp.sidebarVisible()).toBe(true);
    expect(comp.sidebarInert()).toBe(false);
  });

  it('should treat flows and admin child routes as active', () => {
    expect(comp.isFlowsActive()).toBe(true);
    expect(comp.isFlowListActive()).toBe(true);
    expect(comp.isAdminActive()).toBe(false);
    expect(comp.isActivePath('/broker')).toBe(false);
    expect(comp.isActivePath('/queue')).toBe(false);
    expect(comp.isActivePath('/admin/metrics')).toBe(false);
  });

  it('should highlight the Flows submenu item on the home route', () => {
    accountService.authenticate(account);
    fixture.detectChanges();

    const flowsLink: HTMLElement = fixture.nativeElement.querySelector('#flows-menu-items a');
    expect(flowsLink.textContent).toContain('Flows');
    expect(flowsLink.classList.contains('active')).toBe(true);
  });

  it('should label the environment variables submenu item as Variables', () => {
    accountService.authenticate(account);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('#flows-menu').click();
    fixture.detectChanges();

    const labels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('#flows-menu-items span')).map(
      (span: HTMLElement) => span.textContent?.trim(),
    );
    expect(labels).toContain('Variables');
    expect(labels).not.toContain('Environment Variables');
  });

  it('should keep the flows submenu expanded on the Flows list route', () => {
    expect(comp.flowsExpanded()).toBe(true);
    expect(comp.isFlowListActive()).toBe(true);
    expect(comp.brokerExpanded()).toBe(false);
    expect(comp.adminExpanded()).toBe(false);
    expect(comp.accountExpanded()).toBe(false);
  });

  it('should keep manually opened menus open when the navbar is recreated', () => {
    comp.toggleBroker();
    comp.toggleAdmin();
    comp.toggleAccount();

    fixture.destroy();
    fixture = TestBed.createComponent(Navbar);
    comp = fixture.componentInstance;

    expect(comp.flowsExpanded()).toBe(true);
    expect(comp.brokerExpanded()).toBe(true);
    expect(comp.adminExpanded()).toBe(true);
    expect(comp.accountExpanded()).toBe(true);
  });

  it('should toggle submenu expansion independently', () => {
    expect(comp.flowsExpanded()).toBe(true);
    expect(comp.brokerExpanded()).toBe(false);
    expect(comp.adminExpanded()).toBe(false);
    expect(comp.accountExpanded()).toBe(false);

    comp.toggleFlows();
    comp.toggleBroker();
    comp.toggleAdmin();
    comp.toggleAccount();

    expect(comp.flowsExpanded()).toBe(false);
    expect(comp.brokerExpanded()).toBe(true);
    expect(comp.adminExpanded()).toBe(true);
    expect(comp.accountExpanded()).toBe(true);

    comp.toggleFlows();
    comp.toggleBroker();
    comp.toggleAdmin();
    comp.toggleAccount();

    expect(comp.flowsExpanded()).toBe(true);
    expect(comp.brokerExpanded()).toBe(false);
    expect(comp.adminExpanded()).toBe(false);
    expect(comp.accountExpanded()).toBe(false);
  });

  it('should hide submenu items until the group is expanded', () => {
    accountService.authenticate({ ...account, authorities: ['ROLE_ADMIN'] });
    fixture.detectChanges();

    const flowsMenu: HTMLElement = fixture.nativeElement.querySelector('#flows-menu-items');
    const brokerMenu: HTMLElement = fixture.nativeElement.querySelector('#broker-menu-items');
    const adminMenu: HTMLElement = fixture.nativeElement.querySelector('#admin-menu-items');
    const accountMenu: HTMLElement = fixture.nativeElement.querySelector('#account-menu-items');

    expect(flowsMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(false);
    expect(brokerMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(true);
    expect(adminMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(true);
    expect(accountMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(true);

    fixture.nativeElement.querySelector('#flows-menu').click();
    fixture.nativeElement.querySelector('#broker-menu').click();
    fixture.nativeElement.querySelector('#admin-menu').click();
    fixture.nativeElement.querySelector('#account-menu').click();
    fixture.detectChanges();

    expect(flowsMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(true);
    expect(brokerMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(false);
    expect(adminMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(false);
    expect(accountMenu.classList.contains('app-sidebar__subnav--collapsed')).toBe(false);
  });

  it('should render the light or dark logo as the Gateway icon', () => {
    accountService.authenticate(account);
    const theme = TestBed.inject(ThemeService);
    theme.setPreference('LIGHT');
    fixture.detectChanges();

    const icon: HTMLImageElement = fixture.nativeElement.querySelector('.app-sidebar__brand-icon');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('src')).toBe('logo_lightmode.svg');

    theme.setPreference('DARK');
    fixture.detectChanges();
    expect(icon.getAttribute('src')).toBe('logo_darkmode.svg');
  });
});
