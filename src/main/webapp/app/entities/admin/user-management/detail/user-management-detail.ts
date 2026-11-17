import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AlertError } from 'app/shared/alert';
import { RoleLabelPipe } from 'app/shared/auth';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IUserManagement } from '../user-management.model';

@Component({
  selector: 'jhi-user-management-detail',
  templateUrl: './user-management-detail.html',
  imports: [FontAwesomeModule, AlertError, RouterLink, FormatMediumDatetimePipe, RoleLabelPipe],
})
export class UserManagementDetail {
  readonly userManagement = input<IUserManagement | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
