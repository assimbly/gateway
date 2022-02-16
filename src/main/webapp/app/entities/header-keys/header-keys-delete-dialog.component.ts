import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IHeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderKeysService } from './header-keys.service';

@Component({
    selector: 'jhi-header-keys-delete-dialog',
    templateUrl: './header-keys-delete-dialog.component.html'
})
export class HeaderKeysDeleteDialogComponent {
    headerKeys: IHeaderKeys;

    constructor(
        protected headerKeysService: HeaderKeysService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.headerKeysService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('headerKeysListModification', 'Deleted an headerKeys'));
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-header-keys-delete-popup',
    template: ''
})
export class HeaderKeysDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ headerKeys }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(HeaderKeysDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.headerKeys = headerKeys;
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
