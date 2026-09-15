import { Service, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Service()
export class AppPageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(_routerState: RouterStateSnapshot): void {
    this.title.setTitle('Assimbly');
  }
}
