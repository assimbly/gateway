import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header-delete-dialog',
    templateUrl: './header-delete-dialog.component.html'
})
export class HeaderDeleteDialogComponent {
    header: IHeader;
    errorMessage: boolean = false;
    deleteMode: boolean = true;

    constructor(protected headerService: HeaderService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.headerService.delete(id).subscribe(
            response => {
                this.eventManager.broadcast({
                    name: 'headerListModification',
                    content: 'Deleted an header'
                });
                this.activeModal.dismiss(true);
                this.activeModal.dismiss(true);
            },
            r => this.onDeleteError(r)
        );
    }

    private onDeleteError(error) {
        this.errorMessage = true;
        this.deleteMode = false;
    }
}

@Component({
    selector: 'jhi-header-delete-popup',
    template: ''
})
export class HeaderDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ header }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(HeaderDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.header = header;
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
