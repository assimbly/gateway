import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Connection } from 'app/shared/model/connection.model';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { ConnectionKeysDeleteDialogComponent } from './connection-keys-delete-dialog.component';
import { IConnectionKeys, ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { AccountService } from 'app/core/auth/account.service';
import { ConnectionKeysService } from './connection-keys.service';
import { Connections } from '../../shared/camel/connections';

@Component({
    selector: 'jhi-connection-keys',
    templateUrl: './connection-keys.component.html'
})
export class ConnectionKeysComponent implements OnInit, OnChanges {
    @Input() connectionKeys: Array<IConnectionKeys> = [];
    @Input() connection: Connection;

    connectionKeysKeys: Array<string> = [];
    isSaving: boolean;
    connectionKey: IConnectionKeys;
    currentAccount: any;
    eventSubscriber: Subscription;
    requiredConnectionKey: Array<RequiredConnectionKey> = [];
    private requiredType: RequiredConnectionKey;
    driversList: Array<String> = this.connections.driversList;
    jmsProvidersList: Array<String> = ['ActiveMQ Artemis', 'ActiveMQ Classic', 'AMQ'];

    constructor(
        protected connectionKeysService: ConnectionKeysService,
        protected connections: Connections,
        protected alertService: AlertService,
		protected modalService: NgbModal,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.connectionKeysService.query().subscribe(
            (res: HttpResponse<IConnectionKeys[]>) => {
                this.connectionKeys = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInConnectionKeys();
    }

    addRequiredConnectionKeys() {
        this.requiredConnectionKey = this.connections.keysList;
    }

    updateConnectionKeys(id: number) {
        this.connectionKeys = this.connectionKeys.filter(x => x.id !== id);
        this.mapConnectionKeysKeys();
        if (this.connectionKeys.length === 0) {
            this.addConnectionKeys();
        }
    }

	delete(connectionKey: IConnectionKeys): void {
		const modalRef = this.modalService.open(ConnectionKeysDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.connectionKey = connectionKey;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

    ngOnChanges(changes: SimpleChanges) {
        this.mapConnectionKeysKeys();
        if (changes['connectionKeys'] && this.connectionKeys !== undefined) {
            if (this.connectionKeys.length === 1 && this.connectionKeys[0].id === undefined) {
                this.connectionKeys[0].isDisabled = false;
                this.connectionKeys[0].isRequired = false;
            } else {
                this.connectionKeys.forEach(connectionKey => {
                    connectionKey.isDisabled = true;
                });
            }
            const requiredType = this.requiredConnectionKey.find(x => x.name === this.connection.type);
            const requiredConnectionKeys = new Array<ConnectionKeys>();
            requiredType.connectionKeys.forEach(sk => {
                const ersk = this.connectionKeys.find(s => s.key === sk.connectionKeyName);
                let rsk = new ConnectionKeys();
                if (ersk instanceof ConnectionKeys) {
                    rsk = ersk;
                    this.connectionKeys.splice(this.connectionKeys.indexOf(ersk), 1);
                }
                rsk.key = sk.connectionKeyName;
                rsk.valueType = sk.valueType;
                rsk.placeholder = sk.placeholder;
                rsk.isRequired = sk.isRequired;
                requiredConnectionKeys.push(rsk);
            });
            this.connectionKeys.unshift(...requiredConnectionKeys);
        }
    }

    save(connectionKey: ConnectionKeys, i: number) {
        this.isSaving = true;
        if (connectionKey.id) {
            this.subscribeToSaveResponse(this.connectionKeysService.update(connectionKey), false, i);
        } else {
            connectionKey.connectionId = this.connection.id;
            this.subscribeToSaveResponse(this.connectionKeysService.create(connectionKey), true, i);
        }
    }

    addConnectionKeys() {
        const newConnectionKeys = new ConnectionKeys();
        newConnectionKeys.isDisabled = false;
        this.connectionKeys.push(newConnectionKeys);
        this.mapConnectionKeysKeys();
    }

    removeConnectionKeys(i: number) {
        this.connectionKeys.splice(i, 1);
        this.mapConnectionKeysKeys();
        if (this.connectionKeys.length === 0) {
            this.addConnectionKeys();
        }
    }

    editConnectionKey(connectionKey) {
        connectionKey.isDisabled = false;
    }

    mapConnectionKeysKeys() {
        if (typeof this.connectionKeys !== 'undefined') {
            this.connectionKeysKeys = this.connectionKeys.map(sk => sk.key);
            this.connectionKeysKeys = this.connectionKeysKeys.filter(k => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IConnectionKeys>>, isCreate: boolean, i: number) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, isCreate, i);
            }
        });
    }

    cloneConnectionKey(connectionKey: ConnectionKeys) {
        const connectionKeyForClone = new ConnectionKeys(
            null,
            connectionKey.key,
            connectionKey.value,
            null,
            false,
            true,
            null,
            null,
            connectionKey.connectionId
        );
        this.connectionKeys.push(connectionKeyForClone);
    }

    private onSaveSuccess(result: IConnectionKeys, isCreate: boolean, i: number) {
        result.isRequired = this.requiredConnectionKey
            .find(rsk => rsk.name === this.connection.type)
            .connectionKeys.some(sk => sk.connectionKeyName === result.key);

        if (isCreate) {
            result.isDisabled = true;
            this.connectionKeys.splice(i, 1, result);
        } else {
            // this.connectionKeys.find((k) => k.id === result.id).isDisabled = true;
        }
        this.mapConnectionKeysKeys();
		this.eventManager.broadcast(new EventWithContent('connectionKeysListModification', 'OK'));
    }

    private onSaveError() {
        this.isSaving = false;
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IConnectionKeys) {
        return item.id;
    }

    registerChangeInConnectionKeys() {
        this.eventSubscriber = this.eventManager.subscribe('connectionKeysListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}

export interface RequiredConnectionKey {
    name: string;
    connectionKeys: Array<ConnectionKeyInformation>;
}

export interface ConnectionKeyInformation {
    connectionKeyName: string;
    valueType: string;
    placeholder: string;
    isRequired: boolean;
}
