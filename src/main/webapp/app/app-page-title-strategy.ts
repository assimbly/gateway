import { Service, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Service()
export class AppPageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(routerState: RouterStateSnapshot): void {
    this.title.setTitle(pageTitle(this.buildTitle(routerState)));
  }
}

/** The browser tab says which page this is, such as "Flows - Assimbly"; just "Assimbly" for a page without a title. */
export function pageTitle(page: string | undefined): string {
  return page ? `${page} - Assimbly` : 'Assimbly';
}
