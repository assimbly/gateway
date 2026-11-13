import { Component, inject } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';

@Component({
  selector: 'jhi-flow-delete-dialog',
  templateUrl: './flow-delete-dialog.component.html',
  imports: [FontAwesomeModule, AlertError],
})
export class FlowDeleteDialogComponent {
  protected flowService = inject(FlowService);
  activeModal = inject(NgbActiveModal);
  protected eventManager = inject(EventManager);

  flow?: IFlow;
  /** Replaces the confirmation question once the delete is refused. */
  message?: string;
  disableDelete = false;

  clear(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id?: number): void {
    if (id == null || this.disableDelete) {
      return;
    }

    this.disableDelete = true;
    this.flowService.getFlowStatus(id).subscribe({
      next: response => {
        if (response.body === 'started') {
          this.message = 'Active flow can not be deleted. Please stop the flow before deleting.';
          return;
        }

        this.flowService.delete(id).subscribe({
          next: () => {
            this.eventManager.broadcast(new EventWithContent('flowListModification', 'deleted'));
            this.activeModal.dismiss();
          },
          error: () => {
            this.disableDelete = false;
          },
        });
      },
      error: () => {
        this.disableDelete = false;
      },
    });
  }
}
