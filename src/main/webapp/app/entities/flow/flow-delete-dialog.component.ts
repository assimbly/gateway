import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Flow } from './flow.model';
import { FlowPopupService } from './flow-popup.service';
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

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private flowPopupService: FlowPopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.flowPopupService
                .open(FlowDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
