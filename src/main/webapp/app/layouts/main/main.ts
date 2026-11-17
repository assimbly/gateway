import { Component, ElementRef, OnInit, computed, effect, inject, viewChild } from '@angular/core';
import { NavigationEnd, RouterOutlet, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { AccountService } from 'app/core/auth';
import { GatewayStageService } from 'app/entities/integration/gateway-stage.service';
import { ThemeService } from 'app/core/theme';
import { Alert } from 'app/shared/alert';
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
  imports: [RouterOutlet, RouterLink, FontAwesomeModule, Alert, FooterComponent, PageRibbon, TutorialPanelComponent],
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
  /** The Gateway's stage beside the brand, so nobody mistakes production for a test Gateway. */
  readonly stage = inject(GatewayStageService);
  readonly signedIn = computed(() => this.accountService.isAuthenticated());
  /** No menu while a user still has to replace a default password: the Password page is all they can use. */
  readonly sidebarVisible = computed(() => this.signedIn() && !this.accountService.account()?.passwordChangeRequired);
  /** Whether the Gateway lets anyone create an account; otherwise an administrator adds users. */
  readonly registration = toSignal(
    inject(ProfileService)
      .getProfileInfo()
      .pipe(map(info => info.registration === true)),
    { initialValue: false },
  );
  readonly brandIcon = computed(() => (this.theme.appearance() === 'dark' ? 'logo_darkmode.svg' : 'logo_lightmode.svg'));

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly theme = inject(ThemeService);

  constructor() {
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
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
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
  }
}
