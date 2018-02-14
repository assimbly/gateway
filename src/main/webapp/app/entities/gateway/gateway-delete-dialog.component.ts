import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Gateway } from './gateway.model';
import { GatewayPopupService } from './gateway-popup.service';
import { GatewayService } from './gateway.service';

@Component({
    selector: 'jhi-gateway-delete-dialog',
    templateUrl: './gateway-delete-dialog.component.html'
})
export class GatewayDeleteDialogComponent {

    gateway: Gateway;

    constructor(
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.gatewayService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'gatewayListModification',
                content: 'Deleted an gateway'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-gateway-delete-popup',
    template: ''
})
export class GatewayDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private gatewayPopupService: GatewayPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.gatewayPopupService
                .open(GatewayDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
