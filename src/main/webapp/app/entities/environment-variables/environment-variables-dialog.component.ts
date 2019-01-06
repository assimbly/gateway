import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { filter, map } from 'rxjs/operators';
import { EnvironmentVariablesService } from './environment-variables.service';
import { GatewayService } from '../gateway';
import { IGateway } from 'app/shared/model/gateway.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forbiddenEnvironmentKeysValidator } from './environment-variables-validation.directive';
import { IEnvironmentVariables, EnvironmentVariables } from "app/shared/model/environment-variables.model";

@Component({
    selector: 'jhi-environment-variables-dialog',
    templateUrl: './environment-variables-dialog.component.html'
})

export class EnvironmentVariablesDialogComponent implements OnInit {

    environmentVariables: IEnvironmentVariables = new EnvironmentVariables();
    isSaving: boolean;

    gateways: Array<IGateway> = [];
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
            .subscribe((res) => {
                this.gateways = res.body;
                this.environmentVariables.gatewayId = this.gateways[0].id;
                if (!this.environmentVariablesForm.controls.gatewayId.value) {
                    this.environmentVariablesForm.patchValue({
                        'gatewayId': this.environmentVariables.gatewayId
                    });
                }
            }, (res) => this.onError(res));
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

    save() {
        //validate keys and values
        this.environmentVariablesForm.controls.key.updateValueAndValidity();
        if(this.environmentVariables.id===null){
            this.environmentVariablesForm.controls.key.markAsTouched();
        }
        this.environmentVariablesForm.updateValueAndValidity();
        if (this.environmentVariablesForm.invalid) {
            this.isSaving = false;
            return; }
        
        this.isSaving = true;
        this.environmentVariables = this.environmentVariablesForm.value;
        
        //save environment variable
        if (this.environmentVariables.id !== undefined) {
            this.subscribeToSaveResponse(this.environmentVariablesService.update(this.environmentVariables));
        } else {
            this.subscribeToSaveResponse(this.environmentVariablesService.create(this.environmentVariables));
        }
    }
    
    private getAllEnvironmentVariablesKeys() {
        this.environmentVariablesService.query().subscribe((res) => {
            this.allEnvironmentVariablesKeys = res.body.map(res => res.key);
            this.environmentVariablesForm.controls.key.setValidators([Validators.required, forbiddenEnvironmentKeysValidator(this.allEnvironmentVariablesKeys)]);
        });
    }

 
    private subscribeToSaveResponse(result: Observable<HttpResponse<IEnvironmentVariables>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }

    private onSaveSuccess(result: EnvironmentVariables) {
        this.eventManager.broadcast({ name: 'environmentVariablesListModification', content: 'OK' });
        this.isSaving = false;
        this.environmentVariablesForm.patchValue({
            'id': result.id,
            'key': result.key,
            'value': result.value,
            'gatewayId': result.gatewayId
        });
        this.getAllEnvironmentVariablesKeys();
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackGatewayById(index: number, item: IGateway) {
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
    ) { }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
