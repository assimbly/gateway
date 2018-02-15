import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ErrorEndpoint } from './error-endpoint.model';
import { ErrorEndpointPopupService } from './error-endpoint-popup.service';
import { ErrorEndpointService } from './error-endpoint.service';

@Component({
    selector: 'jhi-error-endpoint-delete-dialog',
    templateUrl: './error-endpoint-delete-dialog.component.html'
})
export class ErrorEndpointDeleteDialogComponent {

    errorEndpoint: ErrorEndpoint;

    constructor(
        private errorEndpointService: ErrorEndpointService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.errorEndpointService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'errorEndpointListModification',
                content: 'Deleted an errorEndpoint'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-error-endpoint-delete-popup',
    template: ''
})
export class ErrorEndpointDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private errorEndpointPopupService: ErrorEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.errorEndpointPopupService
                .open(ErrorEndpointDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
