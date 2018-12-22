import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';

@Component({
    selector: 'jhi-wire-tap-endpoint-delete-dialog',
    templateUrl: './wire-tap-endpoint-delete-dialog.component.html'
})
export class WireTapEndpointDeleteDialogComponent {
    wireTapEndpoint: IWireTapEndpoint;

    constructor(
        protected wireTapEndpointService: WireTapEndpointService,
        public activeModal: NgbActiveModal,
        protected eventManager: JhiEventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.wireTapEndpointService.delete(id).subscribe(response => {
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
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ wireTapEndpoint }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(WireTapEndpointDeleteDialogComponent as Component, {
                    size: 'lg',
                    backdrop: 'static'
                });
                this.ngbModalRef.componentInstance.wireTapEndpoint = wireTapEndpoint;
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
