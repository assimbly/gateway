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
    flow: IFlow;
    message = 'Are you sure you want to delete this Flow?';
    disableDelete: boolean;

    constructor(protected flowService: FlowService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager, protected router: Router) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.flowService.getFlowStatus(id).subscribe((response) => {
            if (response.body === 'started') {
                this.message = 'Active flow can not be deleted. Please stop flow before first.';
                this.disableDelete = true;
            } else {
                this.flowService.delete(id).subscribe((r) => {
                    this.router.navigate(['/']);
                    this.activeModal.dismiss(true);                    
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

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

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
