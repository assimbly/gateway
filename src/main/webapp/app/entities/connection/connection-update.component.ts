import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { IConnection } from 'app/shared/model/connection.model';
import { ConnectionKeys } from 'app/shared/model/connection-keys.model';
import { ConnectionService } from './connection.service';
import { ConnectionKeysService } from '../connection-keys/connection-keys.service';
import { RequiredConnectionKey } from '../connection-keys/connection-keys.component';

import { Connections } from '../../shared/camel/connections';

@Component({
  selector: 'jhi-connection-update',
  templateUrl: './connection-update.component.html',
})
export class ConnectionUpdateComponent implements OnInit {
  connection: IConnection;
  isSaving: boolean;
  connectionKeys: Array<ConnectionKeys> = [];
  connectionNames: Array<string> = [];
  connectionKeysKeys: Array<string> = [];

  public driversList: Array<string> = this.connections.driversList;
  jmsProvidersList: Array<string> = ['ActiveMQ Artemis', 'ActiveMQ Classic', 'AMQ'];

  public disableType: boolean;

  requiredConnectionKey: Array<RequiredConnectionKey> = [];
  requiredType: RequiredConnectionKey;
  connectionKeysRemoveList: Array<ConnectionKeys> = [];

  constructor(
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
    this.activatedRoute.data.subscribe(({ connection }) => {
      this.connection = connection;
    });
    this.connectionService.query().subscribe(
      res => {
        this.connectionNames = res.body.map(s => s.name);
      },
      res => this.onError(res.body)
    );
    if (this.activatedRoute.fragment['value'] && this.activatedRoute.fragment['value'] !== 'clone') {
      this.connection.type = this.connections.connectionsList.find(st => st === this.activatedRoute.fragment['value']);
      this.disableType = this.connections.connectionsList.some(st => st === this.activatedRoute.fragment['value']);
    }

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

  save() {
    this.isSaving = true;
    if (this.connection.id) {
      this.subscribeToSaveResponse(this.connectionService.update(this.connection));
    } else {
      this.subscribeToSaveResponse(this.connectionService.create(this.connection));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IConnection>>) {
    result.subscribe(
      (res: HttpResponse<IConnection>) => this.onSaveSuccess(res.body),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected onSaveSuccess(result: IConnection) {
    this.eventManager.broadcast(new EventWithContent('connectionListModification', 'OK'));

    this.isSaving = false;

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

    this.navigateToConnection();
  }

  private onError(error: any) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
  }

  protected onSaveError() {
    this.isSaving = false;
  }

  deleteConnectionKeys(connectionKey) {
    this.connectionKeysService.delete(connectionKey.id).subscribe(() => {
      this.removeConnectionKeys(this.connectionKeys.indexOf(connectionKey));
    });
  }

  navigateToConnection() {
    this.router.navigate(['/connection']);
  }

  navigateToConnectionDetail(connectionId: number) {
    this.router.navigate(['/connection', connectionId]);
    setTimeout(() => {
      this.previousState();
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

  private addRequiredConnectionKeys() {
    this.requiredConnectionKey = this.connections.keysList;
  }
}
