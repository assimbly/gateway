import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { FromEndpoint } from './from-endpoint.model';
import { FromEndpointPopupService } from './from-endpoint-popup.service';
import { FromEndpointService } from './from-endpoint.service';

@Component({
    selector: 'jhi-from-endpoint-delete-dialog',
    templateUrl: './from-endpoint-delete-dialog.component.html'
})
export class FromEndpointDeleteDialogComponent {

    fromEndpoint: FromEndpoint;

    constructor(
        private fromEndpointService: FromEndpointService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.fromEndpointService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'fromEndpointListModification',
                content: 'Deleted an fromEndpoint'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-from-endpoint-delete-popup',
    template: ''
})
export class FromEndpointDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private fromEndpointPopupService: FromEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.fromEndpointPopupService
                .open(FromEndpointDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
