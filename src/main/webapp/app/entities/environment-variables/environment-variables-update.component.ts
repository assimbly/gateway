import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { AlertError } from 'app/shared/alert';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { EnvironmentVariables, IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';
import { IntegrationService } from 'app/entities/integration/integration.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forbiddenEnvironmentKeysValidator } from './environment-variables-validation.directive';

@Component({
    selector: 'jhi-environment-variables-update',
    templateUrl: './environment-variables-update.component.html',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, AlertError],
})
export class EnvironmentVariablesUpdateComponent implements OnInit {
    environmentVariables: IEnvironmentVariables = new EnvironmentVariables();
    isSaving: boolean;

    integrations: IIntegration[] = [];
    environmentVariablesForm: FormGroup;
    private knownVariables: IEnvironmentVariables[] = [];

    constructor(
        protected alertService: AlertService,
        protected environmentVariablesService: EnvironmentVariablesService,
        protected integrationService: IntegrationService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router
    ) {}

    ngOnInit() {
        this.initializeForm();

        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ environmentVariables }) => {
            this.environmentVariables = environmentVariables ?? new EnvironmentVariables();
            if (!this.environmentVariables.encrypted) {
                this.environmentVariables.encrypted = false;
            }
            if (this.activatedRoute.snapshot.fragment === 'clone') {
                this.environmentVariables.id = null;
            }
            this.environmentVariablesForm.patchValue({
                id: this.environmentVariables.id,
                key: this.environmentVariables.key,
                value: this.environmentVariables.value,
                encrypted: this.environmentVariables.encrypted,
                integrationId: this.environmentVariables.integrationId,
            });
            this.applyUniqueKeyValidator();
        });

        this.integrationService.query().subscribe(
            (res: HttpResponse<IIntegration[]>) => {
                this.integrations = res.body;
                this.environmentVariables.integrationId = this.integrations[0].id;
                if (!this.environmentVariablesForm.controls.integrationId.value) {
                    this.environmentVariablesForm.patchValue({
                        integrationId: this.environmentVariables.integrationId
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
            integrationId: new FormControl(this.environmentVariables.integrationId)
        });
    }

    clear() {
        window.history.back();
    }

    save() {
        this.applyUniqueKeyValidator();
        this.environmentVariablesForm.markAllAsTouched();
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
            this.knownVariables = res.body ?? [];
            this.applyUniqueKeyValidator();
        });
    }

    private applyUniqueKeyValidator(): void {
        const currentId = this.environmentVariables?.id;
        const keys = this.knownVariables
            .filter(item => item.id !== currentId)
            .map(item => item.key)
            .filter((key): key is string => !!key);
        this.environmentVariablesForm.controls.key.setValidators([
            Validators.required,
            forbiddenEnvironmentKeysValidator(keys),
        ]);
        this.environmentVariablesForm.controls.key.updateValueAndValidity({ emitEvent: false });
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
   		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});

    }

    trackIntegrationById(index: number, item: IIntegration) {
        return item.id;
    }
}
