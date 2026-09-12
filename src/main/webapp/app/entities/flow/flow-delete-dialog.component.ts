import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AlertError } from 'app/shared/alert';

import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';

@Component({
  selector: 'jhi-flow-delete-dialog',
  templateUrl: './flow-delete-dialog.component.html',
  imports: [FontAwesomeModule, AlertError],
})
export class FlowDeleteDialogComponent {
  flow: IFlow;
  message = 'Are you sure you want to delete this flow?';
  disableDelete: boolean;

  constructor(
    protected flowService: FlowService,
    public activeModal: NgbActiveModal,
    protected router: Router
  ) {}

  clear() {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(id: number) {
    this.flowService.getFlowStatus(id).subscribe(response => {
      if (response.body === 'started') {
        this.message = 'Active flow can not be deleted. Please stop the flow before deleting.';
        this.disableDelete = true;
      } else {
        this.flowService.delete(id).subscribe(r => {
          this.router.navigate(['/']);
          this.activeModal.dismiss(true);
        });
      }
    });
  }
}
