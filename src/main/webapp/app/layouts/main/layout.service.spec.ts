import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LayoutService } from './layout.service';

function stubMatchMedia(matches: boolean): void {
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

describe('LayoutService', () => {
  afterEach(() => {
    localStorage.removeItem(LayoutService.STORAGE_KEY);
    TestBed.resetTestingModule();
  });

  describe('collapsed preference', () => {
    beforeEach(() => {
      stubMatchMedia(true);
      localStorage.removeItem(LayoutService.STORAGE_KEY);
      TestBed.configureTestingModule({
        providers: [provideRouter([])],
      });
    });

    it('defaults to expanded and persists collapsed preference', () => {
      const service = TestBed.inject(LayoutService);

      expect(service.collapsed()).toBe(false);
      expect(service.iconOnly()).toBe(false);

      service.toggleCollapsed();

      expect(service.collapsed()).toBe(true);
      expect(service.iconOnly()).toBe(true);
      expect(localStorage.getItem(LayoutService.STORAGE_KEY)).toBe('true');
    });

    it('keeps other menus open when a later route expands one section', () => {
      const service = TestBed.inject(LayoutService);

      service.syncMenuExpansion({ flows: true, broker: false, admin: false, account: false });
      service.brokerExpanded.set(true);
      service.adminExpanded.set(true);

      service.syncMenuExpansion({ flows: false, broker: true, admin: false, account: false });

      expect(service.flowsExpanded()).toBe(true);
      expect(service.brokerExpanded()).toBe(true);
      expect(service.adminExpanded()).toBe(true);
      expect(service.accountExpanded()).toBe(false);
    });

    it('restores the collapsed preference from localStorage', () => {
      localStorage.setItem(LayoutService.STORAGE_KEY, 'true');
      const service = TestBed.inject(LayoutService);

      expect(service.collapsed()).toBe(true);
      expect(service.iconOnly()).toBe(true);
    });
  });

  describe('mobile overlay', () => {
    beforeEach(() => {
      stubMatchMedia(false);
      localStorage.removeItem(LayoutService.STORAGE_KEY);
      TestBed.configureTestingModule({
        providers: [provideRouter([])],
      });
    });

    it('toggles and closes the mobile overlay without persisting it', () => {
      const service = TestBed.inject(LayoutService);

      expect(service.isDesktop()).toBe(false);
      expect(service.iconOnly()).toBe(false);

      service.toggleMobile();
      expect(service.mobileOpen()).toBe(true);

      service.closeMobile();
      expect(service.mobileOpen()).toBe(false);
      expect(service.hamburgerFocusRequested()).toBe(true);
      expect(localStorage.getItem(LayoutService.STORAGE_KEY)).toBeNull();

      service.consumeHamburgerFocus();
      expect(service.hamburgerFocusRequested()).toBe(false);
    });

    it('closes the overlay on Escape', () => {
      const service = TestBed.inject(LayoutService);
      service.toggleMobile();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));

      expect(service.mobileOpen()).toBe(false);
    });
  });
});
