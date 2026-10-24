import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal';

import { ITEM_DELETED_EVENT } from 'app/config';
import { AlertError } from 'app/shared/alert';
import { TranslateDirective } from 'app/shared/language';
import { UserManagementService } from '../service/user-management.service';
import { IUserManagement } from '../user-management.model';

@Component({
  templateUrl: './user-management-delete-dialog.html',
  imports: [TranslateDirective, FormsModule, FontAwesomeModule, AlertError],
})
export class UserManagementDeleteDialog {
  userManagement?: IUserManagement;
  /** True while the delete runs, so a second click doesn't send it again. */
  readonly deleting = signal(false);

  protected readonly userManagementService = inject(UserManagementService);
  protected readonly activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(login: string): void {
    this.deleting.set(true);
    this.userManagementService.delete(login).subscribe({
      next: () => this.activeModal.close(ITEM_DELETED_EVENT),
      error: () => this.deleting.set(false),
    });
  }
}
