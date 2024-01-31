import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { IConnection, Connection } from 'app/shared/model/connection.model';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';

import { ConnectionService } from './connection.service';
import { ConnectionKeysService } from '../connection-keys/connection-keys.service';
import { RequiredConnectionKey } from '../connection-keys/connection-keys.component';
import { ConnectionPopupService } from 'app/entities/connection/connection-popup.service';
import { Connections } from '../../shared/camel/connections';

@Component({
    selector: 'jhi-connection-dialog',
    templateUrl: './connection-dialog.component.html'
})
export class ConnectionDialogComponent implements OnInit {

    public connectionKeys: Array<ConnectionKeys> = [];
    public connection: Connection;
    public connectionNames: Array<string> = [];
    public isSaving: boolean;
    public connectionKeysKeys: Array<string> = [];
    public driversList: Array<String> = this.connections.driversList;
    jmsProvidersList: Array<String> = ['ActiveMQ Artemis', 'ActiveMQ Classic', 'AMQ'];

    public disableType: boolean;
    public connectionType: string;
    private requiredConnectionKey: Array<RequiredConnectionKey> = [];
    private requiredType: RequiredConnectionKey;
    private connectionKeysRemoveList: Array<ConnectionKeys> = [];

    constructor(
        public activeModal: NgbActiveModal,
        protected connectionService: ConnectionService,
        protected connectionKeysService: ConnectionKeysService,
        public connections: Connections,
        protected eventManager: EventManager,
        protected alertService: AlertService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router
    ) {}

    ngOnInit() {

        this.isSaving = false;
        this.addRequiredConnectionKeys();
        this.connectionService.query().subscribe(
            res => {
                this.connectionNames = res.body.map(s => s.name);
            },
            res => this.onError(res.body)
        );

        if (this.activatedRoute.fragment['value'] === 'clone') {
            this.loadConnectionKeys(true);
        } else {
            this.loadConnectionKeys(false);
        }

    }

    changeType(cloneHeader: boolean) {

        if (typeof this.requiredType !== 'undefined') {
            this.connectionKeysRemoveList = [];
            this.requiredType.connectionKeys.forEach(rsk => {
                this.connectionKeysRemoveList.push(
                    this.connectionKeys.splice(
                        this.connectionKeys.indexOf(this.connectionKeys.find(sk => rsk.connectionKeyName === sk.key && sk.id !== undefined)),
                        1
                    )[0]
                );
            });
        }

        console.log('3. this.connection.type' + this.connection.type);
        this.requiredType = this.requiredConnectionKey.find(x => x.name === this.connection.type);

        const requiredConnectionKeys = new Array<ConnectionKeys>();
        this.requiredType.connectionKeys.forEach(sk => {
            const ersk = this.connectionKeys.find(s => s.key === sk.connectionKeyName);
            let rsk = new ConnectionKeys();
            if (typeof ersk !== 'undefined') {
                if (ersk.value !== '') {
                    rsk = ersk;
                    this.connectionKeys.splice(this.connectionKeys.indexOf(ersk), 1);
                }
            }
            rsk.id = cloneHeader ? null : rsk.id;
            rsk.key = sk.connectionKeyName;
            rsk.valueType = sk.valueType;
            rsk.placeholder = sk.placeholder;
            rsk.isRequired = sk.isRequired;
            requiredConnectionKeys.push(rsk);
        });
        this.connectionKeys.unshift(...requiredConnectionKeys);
    }

    addConnectionKeys() {
        const newConnectionKeys = new ConnectionKeys();
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

    previousState() {
        window.history.back();
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.connection.id !== undefined) {
            this.subscribeToSaveResponse(this.connectionService.update(this.connection));
        } else {
            this.subscribeToSaveResponse(this.connectionService.create(this.connection));
        }
    }

    deleteConnectionKeys(connectionKey) {
        this.connectionKeysService.delete(connectionKey.id).subscribe(() => {
            this.removeConnectionKeys(this.connectionKeys.indexOf(connectionKey));
        });
    }

    clear() {
        console.log('clear');
        this.activeModal.dismiss('cancel');
    }

    navigateToConnection() {
        this.router.navigate(['/connection']);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    navigateToConnectionDetail(connectionId: number) {
        this.router.navigate(['/connection', connectionId]);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    private loadConnectionKeys(cloneHeader: boolean) {
        if (this.connection.id) {
            this.connectionKeysService.query().subscribe(res => {
                this.connectionKeys = res.body.filter(sk => sk.connectionId === this.connection.id);
                this.changeType(cloneHeader);
                this.connection.id = cloneHeader ? null : this.connection.id;
            });
        } else if (this.connection.type) {
            this.changeType(cloneHeader);
            this.connection.id = cloneHeader ? null : this.connection.id;
        }
    }

    private mapConnectionKeysKeys() {
        if (typeof this.connectionKeys !== 'undefined') {
            this.connectionKeysKeys = this.connectionKeys.map(sk => sk.key);
            this.connectionKeysKeys = this.connectionKeysKeys.filter(k => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IConnection>>) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, true);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: Connection, closePopup: boolean) {
	    this.eventManager.broadcast(new EventWithContent('connectionListModification', 'OK'));
	    this.eventManager.broadcast(new EventWithContent('connectionKeysUpdated', result));
	    this.eventManager.broadcast(new EventWithContent('connectionModified', result.id));
        this.isSaving = false;
        this.activeModal.dismiss(result);

        this.connectionKeysRemoveList.forEach(skrl => {
            this.connectionKeysService.delete(skrl.id).subscribe();
        });

        this.connectionKeys.forEach(connectionKey => {
            connectionKey.connectionId = result.id;
            if (connectionKey.id) {
                this.connectionKeysService.update(connectionKey).subscribe(sk => {
                    connectionKey = sk.body;
                });
            } else {
                this.connectionKeysService.create(connectionKey).subscribe(sk => {
                    connectionKey = sk.body;
                });
            }
        });
        this.connectionKeysService.update(this.connectionKeys[0]);
    }

    private onError(error: any) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private addRequiredConnectionKeys() {
        this.requiredConnectionKey = this.connections.keysList;
    }
}

@Component({
    selector: 'jhi-connection-popup',
    template: ''
})
export class ConnectionPopupComponent implements OnInit, OnDestroy {
    routeSub: any;

    constructor(private route: ActivatedRoute, private connectionPopupService: ConnectionPopupService) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if (params['id']) {
                this.connectionPopupService.open(ConnectionDialogComponent as Component, params['id']);
            } else {
                this.connectionPopupService.open(ConnectionDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
