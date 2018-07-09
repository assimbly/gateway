import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { WireTapEndpointPopupService } from './wire-tap-endpoint-popup.service';
import { WireTapEndpointService } from './wire-tap-endpoint.service';

@Component({
    selector: 'jhi-wire-tap-endpoint-delete-dialog',
    templateUrl: './wire-tap-endpoint-delete-dialog.component.html'
})
export class WireTapEndpointDeleteDialogComponent {

    wireTapEndpoint: WireTapEndpoint;

    constructor(
        private wireTapEndpointService: WireTapEndpointService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.wireTapEndpointService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'wireTapEndpointListModification',
                content: 'Deleted an wireTapEndpoint'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-wire-tap-endpoint-delete-popup',
    template: ''
})
export class WireTapEndpointDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private wireTapEndpointPopupService: WireTapEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.wireTapEndpointPopupService
                .open(WireTapEndpointDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
