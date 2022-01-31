import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayService } from 'app/entities/gateway/gateway.service';

@Component({
    selector: 'jhi-flow-update',
    templateUrl: './flow-update.component.html'
})
export class FlowUpdateComponent implements OnInit {
    flow: IFlow;
    isSaving: boolean;

    public logLevelListType = [
        LogLevelType.OFF,
        LogLevelType.INFO,
        LogLevelType.ERROR,
        LogLevelType.TRACE,
        LogLevelType.WARN,
        LogLevelType.DEBUG
    ];

    gateways: IGateway[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected flowService: FlowService,
        protected gatewayService: GatewayService,
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
        result.subscribe(
            (res: HttpResponse<IFlow>) => this.onSaveSuccess(),
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
