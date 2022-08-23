import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IStep } from 'app/shared/model/step.model';
import { StepService } from './step.service';
import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from 'app/entities/flow/flow.service';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from 'app/entities/header/header.service';

@Component({
    selector: 'jhi-step-update',
    templateUrl: './step-update.component.html'
})
export class StepUpdateComponent implements OnInit {
    step: IStep;
    isSaving: boolean;

    flows: IFlow[];

    connections: IConnection[];

    headers: IHeader[];

    constructor(
        protected alertService: AlertService,
        protected stepService: StepService,
        protected flowService: FlowService,
        protected connectionService: ConnectionService,
        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ step }) => {
            this.step = step;
        });
        this.flowService.query().subscribe(
            (res: HttpResponse<IFlow[]>) => {
                this.flows = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.connectionService.query({ filter: 'step-is-null' }).subscribe(
            (res: HttpResponse<IConnection[]>) => {
                if (!this.step.connectionId) {
                    this.connections = res.body;
                } else {
                    this.connectionService.find(this.step.connectionId).subscribe(
                        (subRes: HttpResponse<IConnection>) => {
                            this.connections = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.headerService.query({ filter: 'step-is-null' }).subscribe(
            (res: HttpResponse<IHeader[]>) => {
                if (!this.step.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService.find(this.step.headerId).subscribe(
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
        if (this.step.id !== undefined) {
            this.subscribeToSaveResponse(this.stepService.update(this.step));
        } else {
            this.subscribeToSaveResponse(this.stepService.create(this.step));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IStep>>) {
        result.subscribe(
            (res: HttpResponse<IStep>) => this.onSaveSuccess(),
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

    trackFlowById(index: number, item: IFlow) {
        return item.id;
    }

    trackConnectionById(index: number, item: IConnection) {
        return item.id;
    }

    trackHeaderById(index: number, item: IHeader) {
        return item.id;
    }
}
