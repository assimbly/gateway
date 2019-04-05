import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceService } from 'app/entities/service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from 'app/entities/header';
import { FlowService } from "app/entities/flow";
import { map } from "rxjs/operators";

@Component({
    selector: 'jhi-wire-tap-endpoint-update',
    templateUrl: './wire-tap-endpoint-update.component.html'
})
export class WireTapEndpointUpdateComponent implements OnInit {
    wireTapEndpoint: IWireTapEndpoint;
    isSaving: boolean;

    services: IService[];

    headers: IHeader[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected wireTapEndpointService: WireTapEndpointService,
        protected flowService: FlowService,
        protected serviceService: ServiceService,
        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ wireTapEndpoint }) => {
            this.wireTapEndpoint = wireTapEndpoint;
        });
        this.serviceService.query().subscribe(
            (res: HttpResponse<IService[]>) => {
                this.services = res.body;
                // get options keys
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.headerService.query().subscribe(
            (res: HttpResponse<IHeader[]>) => {
                this.headers = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.wireTapEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(this.wireTapEndpointService.update(this.wireTapEndpoint));
        } else {
            this.subscribeToSaveResponse(this.wireTapEndpointService.create(this.wireTapEndpoint));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IWireTapEndpoint>>) {
        result.subscribe((res: HttpResponse<IWireTapEndpoint>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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

    trackServiceById(index: number, item: IService) {
        return item.id;
    }

    trackHeaderById(index: number, item: IHeader) {
        return item.id;
    }
}
