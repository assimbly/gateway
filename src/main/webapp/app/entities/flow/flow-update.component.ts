import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IFlow, LogLevelType } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationService } from 'app/entities/integration/integration.service';

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

    integrations: IIntegration[];

    constructor(
		protected alertService: AlertService,
        protected flowService: FlowService,
        protected integrationService: IntegrationService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ flow }) => {
            this.flow = flow;
        });
        this.integrationService.query().subscribe(
            (res: HttpResponse<IIntegration[]>) => {
                this.integrations = res.body;
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
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    trackIntegrationById(index: number, item: IIntegration) {
        return item.id;
    }
}
