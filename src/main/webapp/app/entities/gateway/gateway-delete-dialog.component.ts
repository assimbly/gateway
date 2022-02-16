import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';

@Component({
    selector: 'jhi-gateway-delete-dialog',
    templateUrl: './gateway-delete-dialog.component.html'
})
export class GatewayDeleteDialogComponent {
    gateway: IGateway;

    constructor(
        protected gatewayService: GatewayService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager,
        protected router: Router
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.gatewayService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('gatewayListModification', 'Deleted a gateway'));
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-gateway-delete-popup',
    template: ''
})
export class GatewayDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ gateway }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(GatewayDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.gateway = gateway;
                this.ngbModalRef.result.then(
                    result => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    },
                    reason => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    }
                );
            }, 0);
        });
    }

    ngOnDestroy() {
        this.ngbModalRef = null;
    }
}
