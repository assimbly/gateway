import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { ISecurity } from 'app/shared/model/security.model';
import { SecurityService } from './security.service';

@Component({
    selector: 'jhi-security-delete-dialog',
    templateUrl: './security-delete-dialog.component.html'
})
export class SecurityDeleteDialogComponent {
    security: ISecurity;

    constructor(protected securityService: SecurityService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.securityService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'securityListModification',
                content: 'Deleted an security'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-security-delete-popup',
    template: ''
})
export class SecurityDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ security }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(SecurityDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.security = security;
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
