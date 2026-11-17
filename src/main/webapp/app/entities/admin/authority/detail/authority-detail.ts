import { Component, input } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AlertError } from 'app/shared/alert';
import { IAuthority } from '../authority.model';

@Component({
  selector: 'jhi-authority-detail',
  templateUrl: './authority-detail.html',
  imports: [FontAwesomeModule, AlertError],
})
export class AuthorityDetail {
  readonly authority = input<IAuthority | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
