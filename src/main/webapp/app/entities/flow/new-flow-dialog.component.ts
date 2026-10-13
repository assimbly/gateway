import { Component, inject } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FlowTypeChoicesComponent } from './flow-type-choices.component';

/** Creates a Flow: opens the editor for the chosen Flow type, or the Import page to bring one in from a file. */
@Component({
  selector: 'jhi-new-flow-dialog',
  templateUrl: './new-flow-dialog.component.html',
  imports: [FlowTypeChoicesComponent],
})
export class NewFlowDialogComponent {
  readonly activeModal = inject(NgbActiveModal);
}
