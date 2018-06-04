import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { EnvironmentVariables } from './environment-variables.model';
import { EnvironmentVariablesPopupService } from './environment-variables-popup.service';
import { EnvironmentVariablesService } from './environment-variables.service';
import { Gateway, GatewayService } from '../gateway';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-environment-variables-dialog',
    templateUrl: './environment-variables-dialog.component.html'
})
export class EnvironmentVariablesDialogComponent implements OnInit {

    environmentVariables: EnvironmentVariables;
    isSaving: boolean;

    gateways: Gateway[];
    gatewaysLength: number;
    gatewayid?: number;

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private environmentVariablesService: EnvironmentVariablesService,
        private gatewayService: GatewayService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.gatewayService.query()
            .subscribe((res: ResponseWrapper) => {
                this.gateways = res.json;
                this.gatewaysLength = this.gateways.length;
                this.gatewayid = this.gateways[0].id;
                console.log(this.gateways);
            }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.gatewaysLength === 1) {
            this.environmentVariables.gatewayId = this.gatewayid;
        }
        if (this.environmentVariables.id !== undefined) {
            this.subscribeToSaveResponse(
                this.environmentVariablesService.update(this.environmentVariables), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.environmentVariablesService.create(this.environmentVariables), closePopup);
        }
    }

    private subscribeToSaveResponse(result: Observable<EnvironmentVariables>, closePopup: boolean) {
        result.subscribe((res: EnvironmentVariables) =>
            this.onSaveSuccess(res, closePopup), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: EnvironmentVariables, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'environmentVariablesListModification', content: 'OK' });
        this.isSaving = false;
        if (closePopup) {
            this.activeModal.dismiss(result);
        }
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackGatewayById(index: number, item: Gateway) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-environment-variables-popup',
    template: ''
})
export class EnvironmentVariablesPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private environmentVariablesPopupService: EnvironmentVariablesPopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if (params['id']) {
                this.environmentVariablesPopupService
                    .open(EnvironmentVariablesDialogComponent as Component, params['id']);
            } else {
                this.environmentVariablesPopupService
                    .open(EnvironmentVariablesDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
