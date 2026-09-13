import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header-delete-dialog',
    templateUrl: './header-delete-dialog.component.html',
    imports: [FontAwesomeModule, AlertError],
})
export class HeaderDeleteDialogComponent {
    header: IHeader;

    constructor(
        protected headerService: HeaderService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.headerService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('headerListModification', 'Deleted an header'));
            this.activeModal.dismiss(true);
        });
    }
}
