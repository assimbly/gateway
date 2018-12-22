import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';

@Component({
    selector: 'jhi-gateway-update',
    templateUrl: './gateway-update.component.html'
})
export class GatewayUpdateComponent implements OnInit {
    gateway: IGateway;
    isSaving: boolean;

    constructor(protected gatewayService: GatewayService, protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ gateway }) => {
            this.gateway = gateway;
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.gateway.id !== undefined) {
            this.subscribeToSaveResponse(this.gatewayService.update(this.gateway));
        } else {
            this.subscribeToSaveResponse(this.gatewayService.create(this.gateway));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IGateway>>) {
        result.subscribe((res: HttpResponse<IGateway>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }
}
