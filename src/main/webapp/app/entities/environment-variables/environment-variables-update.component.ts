import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { EnvironmentVariables, IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';
import { GatewayService } from 'app/entities/gateway';
import { IGateway } from 'app/shared/model/gateway.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forbiddenEnvironmentKeysValidator } from './environment-variables-validation.directive';

@Component({
    selector: 'jhi-environment-variables-update',
    templateUrl: './environment-variables-update.component.html'
})
export class EnvironmentVariablesUpdateComponent implements OnInit {
    environmentVariables: IEnvironmentVariables = new EnvironmentVariables();
    isSaving: boolean;

    gateways: IGateway[] = [];
    environmentVariablesForm: FormGroup;
    private allEnvironmentVariablesKeys: Array<string> = [];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected environmentVariablesService: EnvironmentVariablesService,
        protected gatewayService: GatewayService,
        protected eventManager: JhiEventManager,
        protected activatedRoute: ActivatedRoute,
        protected router: Router
    ) {}

    ngOnInit() {
        this.initializeForm();

        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ environmentVariables }) => {
            this.environmentVariables = environmentVariables;
        });

        if(!this.environmentVariables.encrypted){
			this.environmentVariables.encrypted = false;
		}		

        if (this.activatedRoute.fragment['value'] === 'clone') {
            this.environmentVariables.id = null;
            this.environmentVariablesForm.patchValue({
                id: null
            });
        }

        this.gatewayService.query().subscribe(
            (res: HttpResponse<IGateway[]>) => {
                this.gateways = res.body;
                this.environmentVariables.gatewayId = this.gateways[0].id;
                if (!this.environmentVariablesForm.controls.gatewayId.value) {
                    this.environmentVariablesForm.patchValue({
                        gatewayId: this.environmentVariables.gatewayId
                    });
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.getAllEnvironmentVariablesKeys();
    }

    previousState() {
        window.history.back();
    }

    initializeForm() {
        this.environmentVariablesForm = new FormGroup({
            id: new FormControl(this.environmentVariables.id),
            key: new FormControl(this.environmentVariables.key, Validators.required),
            value: new FormControl(this.environmentVariables.value, Validators.required),
            encrypted: new FormControl(this.environmentVariables.encrypted),
            gatewayId: new FormControl(this.environmentVariables.gatewayId)
        });
    }

    clear() {
        window.history.back();
    }

    save() {
        if (this.environmentVariables.id === undefined && this.environmentVariables.id === null) {
            this.environmentVariablesForm.controls.key.updateValueAndValidity();
            this.environmentVariablesForm.controls.key.markAsTouched();
        }
        this.environmentVariablesForm.updateValueAndValidity();
        if (this.environmentVariablesForm.invalid) {
            this.isSaving = false;
            return;
        }
        this.isSaving = true;
        this.environmentVariables = this.environmentVariablesForm.value;
        if (this.environmentVariables.id !== undefined && this.environmentVariables.id !== null) {
            this.subscribeToSaveResponse(this.environmentVariablesService.update(this.environmentVariables));
        } else {
            this.subscribeToSaveResponse(this.environmentVariablesService.create(this.environmentVariables));
        }
    }

    private getAllEnvironmentVariablesKeys() {
        this.environmentVariablesService.query().subscribe(res => {
            this.allEnvironmentVariablesKeys = res.body.map(res2 => res2.key);
            this.environmentVariablesForm.controls.key.setValidators([
                Validators.required,
                forbiddenEnvironmentKeysValidator(this.allEnvironmentVariablesKeys)
            ]);
        });
    }

    navigateToEnvironmentVariables() {
        this.router.navigate(['/environment-variables']);
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IEnvironmentVariables>>) {
        result.subscribe(
            (res: HttpResponse<IEnvironmentVariables>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.clear();
        this.navigateToEnvironmentVariables();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackGatewayById(index: number, item: IGateway) {
        return item.id;
    }
}

/*
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
*/
