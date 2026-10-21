import { Component, ElementRef, OnInit, RendererFactory2, Renderer2, computed, effect, inject, viewChild } from '@angular/core';
import { NavigationEnd, RouterOutlet, Router, RouterLink } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import dayjs from 'dayjs/esm';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { AccountService } from 'app/core/auth';
import { ThemeService } from 'app/core/theme';
import { TranslateDirective } from 'app/shared/language';
import FooterComponent from '../footer/footer.component';
import PageRibbon from '../profiles/page-ribbon';
import { TutorialPanelComponent } from 'app/tutorials/tutorial-panel.component';
import { TutorialPanelState } from 'app/tutorials/tutorial-panel.state';
import { ProfileService } from '../profiles/profile.service';
import { LayoutService } from './layout.service';

const PASSWORD_PAGE = '/account/password';

@Component({
  selector: 'jhi-main',
  standalone: true,
  templateUrl: './main.html',
  styleUrl: './main.scss',
  providers: [AppPageTitleStrategy],
  imports: [RouterOutlet, RouterLink, FontAwesomeModule, FooterComponent, PageRibbon, TranslateDirective, TutorialPanelComponent],
  host: {
    class: 'app-shell',
    '[class.app-shell--collapsed]': 'layout.iconOnly()',
    '[class.app-shell--mobile-open]': 'layout.mobileOpen()',
    '[class.app-shell--no-sidebar]': '!sidebarVisible()',
  },
})
export default class Main implements OnInit {
  readonly layout = inject(LayoutService);
  readonly tutorialPanel = inject(TutorialPanelState);
  readonly sidebarVisible = computed(() => this.accountService.isAuthenticated());
  /** Whether the Gateway lets anyone create an account; otherwise an administrator adds users. */
  readonly registration = toSignal(
    inject(ProfileService)
      .getProfileInfo()
      .pipe(map(info => info.registration === true)),
    { initialValue: false },
  );
  readonly brandIcon = computed(() => (this.theme.appearance() === 'dark' ? 'logo_darkmode.svg' : 'logo_lightmode.svg'));

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private renderer: Renderer2;
  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly theme = inject(ThemeService);
  private readonly translateService = inject(TranslateService);

  constructor(rootRenderer: RendererFactory2) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);

    effect(() => {
      if (!this.sidebarVisible()) {
        this.layout.closeMobile();
      }
    });

    // A user who still has a default password stays on the Password page until they choose a new one
    effect(() => {
      if (this.accountService.account()?.passwordChangeRequired) {
        this.toPasswordPage();
      }
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (this.accountService.account()?.passwordChangeRequired) {
        this.toPasswordPage();
      }
    });

    effect(() => {
      if (this.layout.hamburgerFocusRequested()) {
        queueMicrotask(() => {
          this.menuToggle()?.nativeElement.focus();
          this.layout.consumeHamburgerFocus();
        });
      }
    });
  }

  private toPasswordPage(): void {
    if (!this.router.url.startsWith(PASSWORD_PAGE)) {
      this.router.navigateByUrl(PASSWORD_PAGE);
    }
  }

  ngOnInit(): void {
    // try to log in automatically
    this.accountService.identity().subscribe();

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }
}
