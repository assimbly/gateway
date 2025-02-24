import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IStep } from 'app/shared/model/step.model';
import { StepService } from './step.service';

@Component({
  standalone: false,
  selector: 'jhi-step-delete-dialog',
  templateUrl: './step-delete-dialog.component.html'
})
export class StepDeleteDialogComponent {
    step: IStep;

    constructor(
        protected stepService: StepService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.stepService.delete(id).subscribe(response => {
			this.eventManager.broadcast(new EventWithContent('stepListModification', 'Deleted an step'));
            this.activeModal.dismiss(true);
        });
    }
}
