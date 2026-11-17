import { Component, inject } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ImportChoicesComponent } from './import-choices.component';

/** The Import dialog of the Flows page: what can be imported, then the importer of the chosen kind. */
@Component({
  selector: 'jhi-import-dialog',
  templateUrl: './import-dialog.component.html',
  imports: [ImportChoicesComponent],
})
export class ImportDialogComponent {
  readonly activeModal = inject(NgbActiveModal);
}
