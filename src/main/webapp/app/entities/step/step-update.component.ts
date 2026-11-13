import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import { IStep } from 'app/shared/model/step.model';
import { StepService } from './step.service';
import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from 'app/entities/flow/flow.service';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { IMessage } from 'app/shared/model/message.model';
import { SaveShortcutDirective } from 'app/shared/keyboard';
import { MessageService } from 'app/entities/message/message.service';

@Component({
  selector: 'jhi-step-update',
  templateUrl: './step-update.component.html',
  imports: [CommonModule, FormsModule, FontAwesomeModule, AlertError, SaveShortcutDirective],
})
export class StepUpdateComponent implements OnInit {
    step: IStep;
    isSaving: boolean;

    flows: IFlow[];

    connections: IConnection[];

    messages: IMessage[];

    constructor(
        protected alertService: AlertService,
        protected stepService: StepService,
        protected flowService: FlowService,
        protected connectionService: ConnectionService,
        protected messageService: MessageService,
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
        this.connectionService
            .query({ filter: 'step-is-null' })
            .pipe(
                switchMap((res: HttpResponse<IConnection[]>) =>
                    !this.step.connectionId
                        ? of(res.body)
                        : this.connectionService
                              .find(this.step.connectionId)
                              .pipe(map((subRes: HttpResponse<IConnection>) => [subRes.body].concat(res.body)))
                )
            )
            .subscribe(
                connections => (this.connections = connections),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        this.messageService
            .query({ filter: 'step-is-null' })
            .pipe(
                switchMap((res: HttpResponse<IMessage[]>) =>
                    !this.step.messageId
                        ? of(res.body)
                        : this.messageService
                              .find(this.step.messageId)
                              .pipe(map((subRes: HttpResponse<IMessage>) => [subRes.body].concat(res.body)))
                )
            )
            .subscribe(
                messages => (this.messages = messages),
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

    trackMessageById(index: number, item: IMessage) {
        return item.id;
    }
}
