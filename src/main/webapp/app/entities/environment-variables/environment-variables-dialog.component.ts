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
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forbiddenEnvironmentKeysValidator } from './environment-variables-validation.directive';

@Component({
    selector: 'jhi-environment-variables-dialog',
    templateUrl: './environment-variables-dialog.component.html'
})
export class EnvironmentVariablesDialogComponent implements OnInit {

    environmentVariables: EnvironmentVariables = new EnvironmentVariables();
    isSaving: boolean;

    gateways: Array<Gateway> = [];
    environmentVariablesForm: FormGroup;
    private allEnvironmentVariablesKeys: Array<string> = [];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private environmentVariablesService: EnvironmentVariablesService,
        private gatewayService: GatewayService,
        private eventManager: JhiEventManager,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.initializeForm();
        if (this.route.fragment['value'] === 'clone') {
            this.environmentVariables.id = null;
            this.environmentVariablesForm.patchValue({
                'id': null
            });
        }
        this.isSaving = false;
        this.gatewayService.query()
            .subscribe((res: ResponseWrapper) => {
                this.gateways = res.json;
                this.environmentVariables.gatewayId = this.gateways[0].id;
                if (!this.environmentVariablesForm.controls.gatewayId.value) {
                    this.environmentVariablesForm.patchValue({
                        'gatewayId': this.environmentVariables.gatewayId
                    });
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.getAllEnvironmentVariablesKeys();
    }

    initializeForm() {
        this.environmentVariablesForm = new FormGroup({
            'id': new FormControl(this.environmentVariables.id),
            'key': new FormControl(this.environmentVariables.key, Validators.required),
            'value': new FormControl(this.environmentVariables.value, Validators.required),
            'gatewayId': new FormControl(this.environmentVariables.gatewayId)
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        this.environmentVariablesForm.controls.key.updateValueAndValidity();
        this.environmentVariablesForm.controls.key.markAsTouched();
        this.environmentVariablesForm.updateValueAndValidity();
        if (this.environmentVariablesForm.invalid) { return; }
        this.environmentVariables = this.environmentVariablesForm.value;
        if (this.environmentVariables.id !== undefined) {
            this.subscribeToSaveResponse(
                this.environmentVariablesService.update(this.environmentVariables), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.environmentVariablesService.create(this.environmentVariables), closePopup);
        }
    }

    private getAllEnvironmentVariablesKeys() {
        this.environmentVariablesService.query().subscribe((res) => {
            this.allEnvironmentVariablesKeys = res.json.map((env) => env.key);
            this.environmentVariablesForm.controls.key.setValidators(forbiddenEnvironmentKeysValidator(this.allEnvironmentVariablesKeys));
        });
    }

    private subscribeToSaveResponse(result: Observable<EnvironmentVariables>, closePopup: boolean) {
        result.subscribe((res: EnvironmentVariables) =>
            this.onSaveSuccess(res, closePopup), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: EnvironmentVariables, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'environmentVariablesListModification', content: 'OK' });
        this.isSaving = false;
        this.environmentVariablesForm.patchValue({
            'id': result.id,
            'key': result.key,
            'value': result.value,
            'gatewayId': result.gatewayId
        });
        this.getAllEnvironmentVariablesKeys();
        if (closePopup) {
            this.activeModal.dismiss(result);
        } else {
            this.environmentVariablesForm.updateValueAndValidity();
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
