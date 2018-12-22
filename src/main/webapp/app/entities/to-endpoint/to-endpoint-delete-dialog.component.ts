import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ToEndpoint } from './to-endpoint.model';
import { ToEndpointPopupService } from './to-endpoint-popup.service';
import { ToEndpointService } from './to-endpoint.service';

@Component({
    selector: 'jhi-to-endpoint-delete-dialog',
    templateUrl: './to-endpoint-delete-dialog.component.html'
})
export class ToEndpointDeleteDialogComponent {

    toEndpoint: ToEndpoint;

    constructor(
        private toEndpointService: ToEndpointService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.toEndpointService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'toEndpointListModification',
                content: 'Deleted an toEndpoint'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-to-endpoint-delete-popup',
    template: ''
})
export class ToEndpointDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private toEndpointPopupService: ToEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.toEndpointPopupService
                .open(ToEndpointDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
