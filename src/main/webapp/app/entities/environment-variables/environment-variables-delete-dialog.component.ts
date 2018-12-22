import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { EnvironmentVariables } from './environment-variables.model';
import { EnvironmentVariablesPopupService } from './environment-variables-popup.service';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables-delete-dialog',
    templateUrl: './environment-variables-delete-dialog.component.html'
})
export class EnvironmentVariablesDeleteDialogComponent {

    environmentVariables: EnvironmentVariables;

    constructor(
        private environmentVariablesService: EnvironmentVariablesService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.environmentVariablesService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'environmentVariablesListModification',
                content: 'Deleted an environmentVariables'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-environment-variables-delete-popup',
    template: ''
})
export class EnvironmentVariablesDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private environmentVariablesPopupService: EnvironmentVariablesPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.environmentVariablesPopupService
                .open(EnvironmentVariablesDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
