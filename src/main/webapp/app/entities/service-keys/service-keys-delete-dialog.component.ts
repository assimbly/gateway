import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceKeysService } from './service-keys.service';

@Component({
    selector: 'jhi-service-keys-delete-dialog',
    templateUrl: './service-keys-delete-dialog.component.html'
})
export class ServiceKeysDeleteDialogComponent {
    serviceKeys: IServiceKeys;

    constructor(
        protected serviceKeysService: ServiceKeysService,
        public activeModal: NgbActiveModal,
        protected eventManager: JhiEventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.serviceKeysService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'serviceKeysListModification',
                content: 'Deleted an serviceKeys'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-service-keys-delete-popup',
    template: ''
})
export class ServiceKeysDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ serviceKeys }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(ServiceKeysDeleteDialogComponent as Component, {
                    size: 'lg',
                    backdrop: 'static'
                });
                this.ngbModalRef.componentInstance.serviceKeys = serviceKeys;
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
