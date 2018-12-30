import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceService } from 'app/entities/service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from 'app/entities/header';

@Component({
    selector: 'jhi-error-endpoint-update',
    templateUrl: './error-endpoint-update.component.html'
})
export class ErrorEndpointUpdateComponent implements OnInit {
    errorEndpoint: IErrorEndpoint;
    isSaving: boolean;

    services: IService[];

    headers: IHeader[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected errorEndpointService: ErrorEndpointService,
        protected serviceService: ServiceService,
        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ errorEndpoint }) => {
            this.errorEndpoint = errorEndpoint;
        });
        this.serviceService.query().subscribe(
            (res: HttpResponse<IService[]>) => {
                this.services = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.headerService.query({ filter: 'errorendpoint-is-null' }).subscribe(
            (res: HttpResponse<IHeader[]>) => {
                if (!this.errorEndpoint.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService.find(this.errorEndpoint.headerId).subscribe(
                        (subRes: HttpResponse<IHeader>) => {
                            this.headers = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.errorEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(this.errorEndpointService.update(this.errorEndpoint));
        } else {
            this.subscribeToSaveResponse(this.errorEndpointService.create(this.errorEndpoint));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IErrorEndpoint>>) {
        result.subscribe((res: HttpResponse<IErrorEndpoint>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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
