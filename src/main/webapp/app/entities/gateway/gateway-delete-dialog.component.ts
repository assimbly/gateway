import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';

@Component({
    selector: 'jhi-gateway-delete-dialog',
    templateUrl: './gateway-delete-dialog.component.html'
})
export class GatewayDeleteDialogComponent {
    gateway: IGateway;

    message = 'Are you sure you want to delete this Gateway?';
    disableDelete: boolean;

    constructor(
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager,
        private router: Router
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.gatewayService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'gatewayListModification',
                content: 'Deleted an gateway'
            });
            this.activeModal.dismiss(true);
            setTimeout(() => {
                this.router.navigate(['/gateway']);
            }, 0);
        }, (err) => {
            this.message = 'Gateway ' + this.gateway.name + ' can not be deleted (gateway is used by a flow)';
            this.disableDelete = true;
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
