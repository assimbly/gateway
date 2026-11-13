import { DestroyRef, Directive, ElementRef, OnInit, Renderer2, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[jhiActiveMenu]',
})
export default class ActiveMenuDirective implements OnInit {
  readonly jhiActiveMenu = input();

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event: LangChangeEvent) => {
      this.updateActiveFlag(event.lang);
    });

    this.updateActiveFlag(this.translateService.getCurrentLang());
  }

  updateActiveFlag(selectedLanguage: string | null): void {
    if (this.jhiActiveMenu() === selectedLanguage) {
      this.renderer.addClass(this.el.nativeElement, 'active');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active');
    }
  }
}
