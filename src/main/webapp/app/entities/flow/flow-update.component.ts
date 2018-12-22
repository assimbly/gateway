import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayService } from 'app/entities/gateway';
import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { FromEndpointService } from 'app/entities/from-endpoint';
import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { ErrorEndpointService } from 'app/entities/error-endpoint';

@Component({
    selector: 'jhi-flow-update',
    templateUrl: './flow-update.component.html'
})
export class FlowUpdateComponent implements OnInit {
    flow: IFlow;
    isSaving: boolean;

    gateways: IGateway[];

    fromendpoints: IFromEndpoint[];

    errorendpoints: IErrorEndpoint[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected flowService: FlowService,
        protected gatewayService: GatewayService,
        protected fromEndpointService: FromEndpointService,
        protected errorEndpointService: ErrorEndpointService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ flow }) => {
            this.flow = flow;
        });
        this.gatewayService.query().subscribe(
            (res: HttpResponse<IGateway[]>) => {
                this.gateways = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.fromEndpointService.query({ filter: 'flowroute-is-null' }).subscribe(
            (res: HttpResponse<IFromEndpoint[]>) => {
                if (!this.flow.fromEndpointId) {
                    this.fromendpoints = res.body;
                } else {
                    this.fromEndpointService.find(this.flow.fromEndpointId).subscribe(
                        (subRes: HttpResponse<IFromEndpoint>) => {
                            this.fromendpoints = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.errorEndpointService.query({ filter: 'flowroute-is-null' }).subscribe(
            (res: HttpResponse<IErrorEndpoint[]>) => {
                if (!this.flow.errorEndpointId) {
                    this.errorendpoints = res.body;
                } else {
                    this.errorEndpointService.find(this.flow.errorEndpointId).subscribe(
                        (subRes: HttpResponse<IErrorEndpoint>) => {
                            this.errorendpoints = [subRes.body].concat(res.body);
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
        if (this.flow.id !== undefined) {
            this.subscribeToSaveResponse(this.flowService.update(this.flow));
        } else {
            this.subscribeToSaveResponse(this.flowService.create(this.flow));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IFlow>>) {
        result.subscribe((res: HttpResponse<IFlow>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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

    trackFromEndpointById(index: number, item: IFromEndpoint) {
        return item.id;
    }

    trackErrorEndpointById(index: number, item: IErrorEndpoint) {
        return item.id;
    }
}
