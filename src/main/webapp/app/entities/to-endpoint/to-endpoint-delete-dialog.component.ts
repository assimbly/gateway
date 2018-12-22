import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IToEndpoint } from 'app/shared/model/to-endpoint.model';
import { ToEndpointService } from './to-endpoint.service';

@Component({
    selector: 'jhi-to-endpoint-delete-dialog',
    templateUrl: './to-endpoint-delete-dialog.component.html'
})
export class ToEndpointDeleteDialogComponent {
    toEndpoint: IToEndpoint;

    constructor(
        protected toEndpointService: ToEndpointService,
        public activeModal: NgbActiveModal,
        protected eventManager: JhiEventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.toEndpointService.delete(id).subscribe(response => {
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
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ toEndpoint }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(ToEndpointDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.toEndpoint = toEndpoint;
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
