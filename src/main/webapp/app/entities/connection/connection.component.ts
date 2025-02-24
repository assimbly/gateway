import { Component, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { IConnection, Connection } from 'app/shared/model/connection.model';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { AccountService } from 'app/core/auth/account.service';
import { ConnectionService } from './connection.service';
import { ConnectionKeysComponent } from '../../entities/connection-keys/connection-keys.component';
import { ConnectionKeysService } from '../../entities/connection-keys/connection-keys.service';
import { Connections } from '../../shared/camel/connections';
import { Observable } from 'rxjs';

@Component({
    standalone: false,
    selector: 'jhi-connection',
    templateUrl: './connection.component.html',
})
export class ConnectionComponent implements OnInit, OnDestroy, OnChanges {
    [x: string]: any;
    connections: IConnection[];
    currentAccount: any;
    eventSubscriber: Subscription;
    connectionKey: ConnectionKeys;
    connectionKeys: Array<ConnectionKeys>;
    connection: Connection;
    type: any;
    isSaving: boolean;
    disabledConnectionType = true;
    selectedConnection: Connection = new Connection();

    constructor(
        protected connectionService: ConnectionService,
        protected alertService: AlertService,
        public connectionsLists: Connections,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.connectionService.query().subscribe(
            (res: HttpResponse<IConnection[]>) => {
                this.connections = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['connectionKeys'] && this.connectionKeys !== undefined) {
            if (this.connectionKeys.length === 1 && this.connectionKeys[0].id === undefined) {
                this.connectionKeys[0].isDisabled = false;
            } else {
                this.connectionKeys.forEach(connectionKey => {
                    connectionKey.isDisabled = true;
                });
            }
        }
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        if (this.connectionKey !== undefined) {
            this.eventManager.subscribe('connectionKeyDeleted', res => this.updateConnectionKeys(parseInt(res.toString())));
        } else {
            this.eventManager.subscribe('connectionKeyDeleted', res => res);
        }
        this.registerChangeInServices();
    }
    updateConnectionKeys(id: number) {
        this.connectionKeys = this.connectionKeys.filter(x => x.id === id);
        const newConnectionKeys = new ConnectionKeys();
        this.connectionKeys.push(newConnectionKeys);
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    filterConnectionKeys() {
        if (this.selectedConnection === null) {
            this.selectedConnection = new Connection();
        } else {
            this.connectionKeysService.query().subscribe(
                res => {
                    this.connectionKeys = res.json;
                    this.connectionKeys = this.connectionKeys.filter(k => k.connectionId === this.selectedConnection.id);
                    if (this.connectionKeys.length === 0) {
                        const newConnectionKeys = new ConnectionKeys();
                        newConnectionKeys.isDisabled = false;
                        this.connectionKeys.push(newConnectionKeys);
                    }
                },
                res => this.onError(res.json)
            );
        }
    }

    saveConnectionType(connection: Connection) {
        this.isSaving = true;
        this.subscribeToSaveResponse(this.connectionService.update(connection));
        this.disabledConnectionType = true;
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IConnection>>) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: Connection) {
        this.isSaving = false;
    }

    edit() {
        this.disabledConnectionType = false;
    }
    private onSaveError() {
        this.isSaving = false;
    }
    trackId(index: number, item: Connection) {
        return item.id;
    }

    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('connectionListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
