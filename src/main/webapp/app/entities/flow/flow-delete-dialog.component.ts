import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';

@Component({
    selector: 'jhi-flow-delete-dialog',
    templateUrl: './flow-delete-dialog.component.html'
})
export class FlowDeleteDialogComponent {

    flow: Flow;
    message = 'Are you sure you want to delete this Flow?';
    disableDelete: boolean;

    constructor(
        private flowService: FlowService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.flowService.getFlowStatus(id).subscribe((response) => {
            if (response.text() === 'started') {
                this.message = 'Active flow can not be deleted. Please stop flow before first.';
                this.disableDelete = true;
            } else {
                this.flowService.delete(id).subscribe((r) => {
                    this.activeModal.dismiss(true);
                    window.history.back();
                });
            }
        });
    }
}

@Component({
    selector: 'jhi-flow-delete-popup',
    template: ''
})
export class FlowDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    routeSub: any;

    constructor(private flowPopupService: FlowPopupService,protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ flow }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(FlowDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.flow = flow;
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
