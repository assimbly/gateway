import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IConnectionKeys } from 'app/shared/model/connection-keys.model';
import { ConnectionKeysService } from './connection-keys.service';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionService } from 'app/entities/connection/connection.service';

@Component({
    standalone: false,
    selector: 'jhi-connection-keys-update',
    templateUrl: './connection-keys-update.component.html'
})
export class ConnectionKeysUpdateComponent implements OnInit {
    connectionKeys: IConnectionKeys;
    isSaving: boolean;

    connections: IConnection[];

    constructor(
		protected alertService: AlertService,
        protected connectionKeysService: ConnectionKeysService,
        protected connectionService: ConnectionService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ connectionKeys }) => {
            this.connectionKeys = connectionKeys;
        });
        this.connectionService.query().subscribe(
            (res: HttpResponse<IConnection[]>) => {
                this.connections = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.connectionKeys.id !== undefined) {
            this.subscribeToSaveResponse(this.connectionKeysService.update(this.connectionKeys));
        } else {
            this.subscribeToSaveResponse(this.connectionKeysService.create(this.connectionKeys));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IConnectionKeys>>) {
        result.subscribe(
            (res: HttpResponse<IConnectionKeys>) => this.onSaveSuccess(),
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

    trackConnectionById(index: number, item: IConnection) {
        return item.id;
    }
}
