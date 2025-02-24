import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from './header.service';
import { IMessage } from 'app/shared/model/message.model';
import { MessageService } from 'app/entities/message/message.service';

@Component({
    standalone: false,
    selector: 'jhi-header-update',
    templateUrl: './header-update.component.html'
})
export class HeaderUpdateComponent implements OnInit {
    header: IHeader;
    isSaving: boolean;

    messages: IMessage[];

    constructor(
		protected alertService: AlertService,
        protected headerService: HeaderService,
        protected messageService: MessageService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ header }) => {
            this.header = header;
        });
        this.messageService.query().subscribe(
            (res: HttpResponse<IMessage[]>) => {
                this.messages = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.header.id !== undefined) {
            this.subscribeToSaveResponse(this.headerService.update(this.header));
        } else {
            this.subscribeToSaveResponse(this.headerService.create(this.header));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IHeader>>) {
        result.subscribe(
            (res: HttpResponse<IHeader>) => this.onSaveSuccess(),
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

    trackMessageById(index: number, item: IMessage) {
        return item.id;
    }
}
