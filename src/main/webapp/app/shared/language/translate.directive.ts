import { DestroyRef, Directive, ElementRef, OnChanges, OnInit, SecurityContext, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { translationNotFoundMessage } from 'app/config';

/**
 * A wrapper directive on top of the translation pipe as the inbuilt translation directive from ngx-translate is too verbose and buggy
 */
@Directive({
  selector: '[jhiTranslate]',
})
export default class TranslateDirective implements OnChanges, OnInit {
  readonly jhiTranslate = input.required<string>();
  readonly translateValues = input<Record<string, unknown>>();

  private readonly el = inject(ElementRef);
  private readonly translateService = inject(TranslateService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.getTranslation();
    });
    this.translateService.onTranslationChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.getTranslation();
    });
  }

  ngOnChanges(): void {
    this.getTranslation();
  }

  private getTranslation(): void {
    this.translateService
      .get(this.jhiTranslate(), this.translateValues())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: value => {
          // translations may hold markup, their values (a login, a name) come from users
          this.el.nativeElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
        },
        error: () => {
          this.el.nativeElement.textContent = `${translationNotFoundMessage}[${this.jhiTranslate()}]`;
        },
      });
  }
}
