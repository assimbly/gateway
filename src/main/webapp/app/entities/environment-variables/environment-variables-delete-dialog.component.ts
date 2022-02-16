import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables-delete-dialog',
    templateUrl: './environment-variables-delete-dialog.component.html'
})
export class EnvironmentVariablesDeleteDialogComponent {
    environmentVariables: IEnvironmentVariables;

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        public activeModal: NgbActiveModal,
        protected eventManager: EventManager
    ) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.environmentVariablesService.delete(id).subscribe(response => {
		    this.eventManager.broadcast(new EventWithContent('environmentVariablesListModification', 'Deleted an environmentVariables'));
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-environment-variables-delete-popup',
    template: ''
})
export class EnvironmentVariablesDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ environmentVariables }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(EnvironmentVariablesDeleteDialogComponent as Component, {
                    size: 'lg',
                    backdrop: 'static'
                });
                this.ngbModalRef.componentInstance.environmentVariables = environmentVariables;
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
