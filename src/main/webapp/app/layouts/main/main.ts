import { Component, ElementRef, OnInit, RendererFactory2, Renderer2, computed, effect, inject, viewChild } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import dayjs from 'dayjs/esm';

import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { AccountService } from 'app/core/auth';
import { TranslateDirective } from 'app/shared/language';
import FooterComponent from '../footer/footer.component';
import PageRibbon from '../profiles/page-ribbon';
import { LayoutService } from './layout.service';

@Component({
  selector: 'jhi-main',
  standalone: true,
  templateUrl: './main.html',
  styleUrl: './main.scss',
  providers: [AppPageTitleStrategy],
  imports: [RouterOutlet, RouterLink, FontAwesomeModule, FooterComponent, PageRibbon, TranslateDirective],
  host: {
    class: 'app-shell',
    '[class.app-shell--collapsed]': 'layout.iconOnly()',
    '[class.app-shell--mobile-open]': 'layout.mobileOpen()',
    '[class.app-shell--no-sidebar]': '!sidebarVisible()',
  },
})
export default class Main implements OnInit {
  readonly layout = inject(LayoutService);
  readonly sidebarVisible = computed(() => this.accountService.isAuthenticated());

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private renderer: Renderer2;
  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);

  constructor(rootRenderer: RendererFactory2) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);

    effect(() => {
      if (!this.sidebarVisible()) {
        this.layout.closeMobile();
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
