import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesService } from './environment-variables.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayService } from 'app/entities/gateway';

@Component({
    selector: 'jhi-environment-variables-update',
    templateUrl: './environment-variables-update.component.html'
})
export class EnvironmentVariablesUpdateComponent implements OnInit {
    environmentVariables: IEnvironmentVariables;
    isSaving: boolean;

    gateways: IGateway[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected environmentVariablesService: EnvironmentVariablesService,
        protected gatewayService: GatewayService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ environmentVariables }) => {
            this.environmentVariables = environmentVariables;
        });
        this.gatewayService.query().subscribe(
            (res: HttpResponse<IGateway[]>) => {
                this.gateways = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.environmentVariables.id !== undefined) {
            this.subscribeToSaveResponse(this.environmentVariablesService.update(this.environmentVariables));
        } else {
            this.subscribeToSaveResponse(this.environmentVariablesService.create(this.environmentVariables));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IEnvironmentVariables>>) {
        result.subscribe(
            (res: HttpResponse<IEnvironmentVariables>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
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
