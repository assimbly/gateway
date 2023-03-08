import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { ILink } from 'app/shared/model/link.model';
import { LinkService } from './link.service';

@Component({
    selector: 'jhi-link-delete-dialog',
    templateUrl: './link-delete-dialog.component.html'
})
export class LinkDeleteDialogComponent {
    link: ILink;

    constructor(
        protected linkService: LinkService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.linkService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('linkListModification', 'Deleted an link'));
            this.activeModal.dismiss(true);
        });
    }
}