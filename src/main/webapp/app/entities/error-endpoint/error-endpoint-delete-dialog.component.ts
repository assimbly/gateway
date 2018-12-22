import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';

@Component({
    selector: 'jhi-error-endpoint-delete-dialog',
    templateUrl: './error-endpoint-delete-dialog.component.html'
})
export class ErrorEndpointDeleteDialogComponent {
    errorEndpoint: IErrorEndpoint;

    constructor(
        protected errorEndpointService: ErrorEndpointService,
        public activeModal: NgbActiveModal,
        protected eventManager: JhiEventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.errorEndpointService.delete(id).subscribe(response => {
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
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ errorEndpoint }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(ErrorEndpointDeleteDialogComponent as Component, {
                    size: 'lg',
                    backdrop: 'static'
                });
                this.ngbModalRef.componentInstance.errorEndpoint = errorEndpoint;
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
