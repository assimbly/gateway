import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { filter, map } from 'rxjs/operators';
import { EnvironmentVariablesService } from './environment-variables.service';
import { IntegrationService } from 'app/entities/integration/integration.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forbiddenEnvironmentKeysValidator } from './environment-variables-validation.directive';
import { IEnvironmentVariables, EnvironmentVariables } from 'app/shared/model/environment-variables.model';

@Component({
    selector: 'jhi-environment-variables-dialog',
    templateUrl: './environment-variables-dialog.component.html'
})
export class EnvironmentVariablesDialogComponent implements OnInit {
    environmentVariables: IEnvironmentVariables = new EnvironmentVariables();
    isSaving: boolean;

    integrations: Array<IIntegration> = [];
    environmentVariablesForm: FormGroup;
    private allEnvironmentVariablesKeys: Array<string> = [];

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private environmentVariablesService: EnvironmentVariablesService,
        private integrationService: IntegrationService,
        private eventManager: EventManager,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.initializeForm();
        if (this.route.fragment['value'] === 'clone') {
            this.environmentVariables.id = null;
            this.environmentVariablesForm.patchValue({
                id: null
            });
        }
        this.isSaving = false;
        this.integrationService.query().subscribe(
            res => {
                this.integrations = res.body;
                this.environmentVariables.integrationId = this.integrations[0].id;
                if (!this.environmentVariablesForm.controls.integrationId.value) {
                    this.environmentVariablesForm.patchValue({
                        integrationId: this.environmentVariables.integrationId
                    });
                }
            },
            res => this.onError(res)
        );
        this.getAllEnvironmentVariablesKeys();
    }

    initializeForm() {
        this.environmentVariablesForm = new FormGroup({
            id: new FormControl(this.environmentVariables.id),
            key: new FormControl(this.environmentVariables.key, Validators.required),
            value: new FormControl(this.environmentVariables.value, Validators.required),
            integrationId: new FormControl(this.environmentVariables.integrationId)
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        // validate keys and values
        this.environmentVariablesForm.controls.key.updateValueAndValidity();
        if (this.environmentVariables.id === null) {
            this.environmentVariablesForm.controls.key.markAsTouched();
        }
        this.environmentVariablesForm.updateValueAndValidity();
        if (this.environmentVariablesForm.invalid) {
            this.isSaving = false;
            return;
        }

        this.isSaving = true;
        this.environmentVariables = this.environmentVariablesForm.value;

        // save environment variable
        if (this.environmentVariables.id !== undefined) {
            this.subscribeToSaveResponse(this.environmentVariablesService.update(this.environmentVariables));
        } else {
            this.subscribeToSaveResponse(this.environmentVariablesService.create(this.environmentVariables));
        }
    }

    private getAllEnvironmentVariablesKeys() {
        this.environmentVariablesService.query().subscribe(res => {
            this.allEnvironmentVariablesKeys = res.body.map(res => res.key);
            this.environmentVariablesForm.controls.key.setValidators([
                Validators.required,
                forbiddenEnvironmentKeysValidator(this.allEnvironmentVariablesKeys)
            ]);
        });
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IEnvironmentVariables>>) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: EnvironmentVariables) {
        this.eventManager.broadcast({ name: 'environmentVariablesListModification', content: 'OK' });
        this.isSaving = false;
        this.environmentVariablesForm.patchValue({
            id: result.id,
            key: result.key,
            value: result.value,
            integrationId: result.integrationId
        });
        this.getAllEnvironmentVariablesKeys();
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(errorMessage: any) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    trackIntegrationById(index: number, item: IIntegration) {
        return item.id;
    }
}
