import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { FromEndpointService } from './from-endpoint.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceService } from 'app/entities/service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from 'app/entities/header';

@Component({
    selector: 'jhi-from-endpoint-update',
    templateUrl: './from-endpoint-update.component.html'
})
export class FromEndpointUpdateComponent implements OnInit {
    fromEndpoint: IFromEndpoint;
    isSaving: boolean;

    services: IService[];

    headers: IHeader[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected fromEndpointService: FromEndpointService,
        protected serviceService: ServiceService,
        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ fromEndpoint }) => {
            this.fromEndpoint = fromEndpoint;
        });
        this.serviceService.query({ filter: 'fromendpoint-is-null' }).subscribe(
            (res: HttpResponse<IService[]>) => {
                if (!this.fromEndpoint.serviceId) {
                    this.services = res.body;
                } else {
                    this.serviceService.find(this.fromEndpoint.serviceId).subscribe(
                        (subRes: HttpResponse<IService>) => {
                            this.services = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.headerService.query({ filter: 'fromendpoint-is-null' }).subscribe(
            (res: HttpResponse<IHeader[]>) => {
                if (!this.fromEndpoint.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService.find(this.fromEndpoint.headerId).subscribe(
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
        if (this.fromEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(this.fromEndpointService.update(this.fromEndpoint));
        } else {
            this.subscribeToSaveResponse(this.fromEndpointService.create(this.fromEndpoint));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IFromEndpoint>>) {
        result.subscribe((res: HttpResponse<IFromEndpoint>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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
