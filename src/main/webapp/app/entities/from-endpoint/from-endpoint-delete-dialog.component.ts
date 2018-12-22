import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { FromEndpointService } from './from-endpoint.service';

@Component({
    selector: 'jhi-from-endpoint-delete-dialog',
    templateUrl: './from-endpoint-delete-dialog.component.html'
})
export class FromEndpointDeleteDialogComponent {
    fromEndpoint: IFromEndpoint;

    constructor(
        protected fromEndpointService: FromEndpointService,
        public activeModal: NgbActiveModal,
        protected eventManager: JhiEventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.fromEndpointService.delete(id).subscribe(response => {
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
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ fromEndpoint }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(FromEndpointDeleteDialogComponent as Component, {
                    size: 'lg',
                    backdrop: 'static'
                });
                this.ngbModalRef.componentInstance.fromEndpoint = fromEndpoint;
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
