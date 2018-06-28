import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Maintenance } from './maintenance.model';
import { MaintenancePopupService } from './maintenance-popup.service';
import { MaintenanceService } from './maintenance.service';
import { Flow, FlowService } from '../flow';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-maintenance-dialog',
    templateUrl: './maintenance-dialog.component.html'
})
export class MaintenanceDialogComponent implements OnInit {

    maintenance: Maintenance;
    isSaving: boolean;

    flows: Flow[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private maintenanceService: MaintenanceService,
        private flowService: FlowService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.flowService.query()
            .subscribe((res: ResponseWrapper) => { this.flows = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.maintenance.id !== undefined) {
            this.subscribeToSaveResponse(
                this.maintenanceService.update(this.maintenance));
        } else {
            this.subscribeToSaveResponse(
                this.maintenanceService.create(this.maintenance));
        }
    }

    private subscribeToSaveResponse(result: Observable<Maintenance>) {
        result.subscribe((res: Maintenance) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Maintenance) {
        this.eventManager.broadcast({ name: 'maintenanceListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackFlowById(index: number, item: Flow) {
        return item.id;
    }

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
}

@Component({
    selector: 'jhi-maintenance-popup',
    template: ''
})
export class MaintenancePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private maintenancePopupService: MaintenancePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.maintenancePopupService
                    .open(MaintenanceDialogComponent as Component, params['id']);
            } else {
                this.maintenancePopupService
                    .open(MaintenanceDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
