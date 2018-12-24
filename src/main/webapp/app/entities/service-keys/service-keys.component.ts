import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Service } from 'app/shared/model/service.model';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { IServiceKeys, ServiceKeys } from 'app/shared/model/service-keys.model';
import { AccountService } from 'app/core';
import { ServiceKeysService } from './service-keys.service';

@Component({
    selector: 'jhi-service-keys',
    templateUrl: './service-keys.component.html'
})
export class ServiceKeysComponent implements OnInit, OnChanges {
    @Input() serviceKeys: Array<IServiceKeys> = [];
    @Input() service: Service;

    serviceKeysKeys: Array<string> = [];
    currentAccount: any;
    isSaving: boolean;
    serviceKey: IServiceKeys;
    eventSubscriber: Subscription;
    requiredServiceKey: Array<RequiredServiceKey> = [];
    listVal: Array<String> = ['com.mysql.jdbc.Driver', 'org.postgresql.Driver'];

    constructor(
        private serviceKeysService: ServiceKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager
    ) {
    }

    loadAll() {
        this.serviceKeysService.query().subscribe(
            (res: HttpResponse<ServiceKeys[]>) => {
                this.serviceKeys = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.eventManager.subscribe('serviceKeyDeleted', (res) => this.updateServiceKeys(res.content));
    }

    addRequiredServiceKeys() {
        this.requiredServiceKey.push(
            {
                name: 'JDBC Connection',
                serviceKeys: [
                    {
                        serviceKeyName: 'url',
                        valueType: 'text',
                        placeholder: 'Example jdbc:mysql://localhost/dbname'
                    },
                    {
                        serviceKeyName: 'username',
                        valueType: 'text',
                        placeholder: ''
                    },
                    {
                        serviceKeyName: 'password ',
                        valueType: 'password',
                        placeholder: ''
                    },
                    {
                        serviceKeyName: 'driver',
                        valueType: 'list',
                        placeholder: ''
                    }
                ]
            },
            {
                name: 'SonicMQ Connection',
                serviceKeys: [
                    {
                        serviceKeyName: 'url',
                        valueType: 'text',
                        placeholder: 'Example tcp://localhost:2506'
                    },
                    {
                        serviceKeyName: 'username',
                        valueType: 'text',
                        placeholder: 'Example Administrator'
                    },
                    {
                        serviceKeyName: 'password',
                        valueType: 'password',
                        placeholder: ''
                    }
                ]
            },
            {
                name: 'ActiveMQ Connection',
                serviceKeys: [
                    {
                        serviceKeyName: 'url',
                        valueType: 'text',
                        placeholder: 'Example tcp://localhost:61616'
                    }
                ]
            },
            {
                name: 'MQ Connection',
                serviceKeys: [
                    {
                        serviceKeyName: 'url',
                        valueType: 'text',
                        placeholder: ''
                    }
                ]
            }
        )
    }

    updateServiceKeys(id: number) {
        this.serviceKeys = this.serviceKeys.filter((x) => x.id !== id);
        this.mapServiceKeysKeys();
        if (this.serviceKeys.length === 0) {
            this.addServiceKeys();
        }
    }
    ngOnChanges(changes: SimpleChanges) {
        this.mapServiceKeysKeys();
        if (changes['serviceKeys'] && this.serviceKeys !== undefined) {
            if (this.serviceKeys.length === 1 && this.serviceKeys[0].id === undefined) {
                (this.serviceKeys[0] as any).isDisabled = false;
                (this.serviceKeys[0] as any).isRequired = false;
            } else {
                this.serviceKeys.forEach((serviceKey) => {
                    (serviceKey as any).isDisabled = true;
                });
            }
            const requiredType = this.requiredServiceKey.find((x) => x.name === this.service.type);
            const requiredServiceKeys = new Array<ServiceKeys>();
            requiredType.serviceKeys.forEach((sk) => {
                let ersk = this.serviceKeys.find((s) => s.key === sk.serviceKeyName);
                let rsk = new ServiceKeys();
                if (ersk instanceof ServiceKeys) {
                    rsk = ersk;
                    this.serviceKeys.splice(this.serviceKeys.indexOf(ersk), 1);
                }
                rsk.key = sk.serviceKeyName;
                (rsk as any).valueType = sk.valueType;
                (rsk as any).placeholder = sk.placeholder;
                (rsk as any).isRequired = true;
                requiredServiceKeys.push(rsk);
            });
            this.serviceKeys.unshift(...requiredServiceKeys);
        }
    }
    save(serviceKey: ServiceKeys, i: number) {
        this.isSaving = true;
        if (!!serviceKey.id) {
            this.subscribeToSaveResponse(
                this.serviceKeysService.update(serviceKey), false, i);
        } else {
            serviceKey.serviceKeysId = this.service.id;
            this.subscribeToSaveResponse(
                this.serviceKeysService.create(serviceKey), true, i);
        }
    }
    addServiceKeys() {
        const newServiceKeys = new ServiceKeys();
        (newServiceKeys as any).isDisabled = false;
        this.serviceKeys.push(newServiceKeys);
        this.mapServiceKeysKeys();
    }

    removeServiceKeys(i: number) {
        this.serviceKeys.splice(i, 1);
        this.mapServiceKeysKeys();
        if (this.serviceKeys.length === 0) {
            this.addServiceKeys();
        }
    }
    editServiceKey(serviceKey) {
        serviceKey.isDisabled = false;
    }

    mapServiceKeysKeys() {
        if (typeof this.serviceKeys !== 'undefined') {
            this.serviceKeysKeys = this.serviceKeys.map((sk) => sk.key);
            this.serviceKeysKeys = this.serviceKeysKeys.filter((k) => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IServiceKeys>>,isCreate: boolean, i: number) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body,isCreate,i);
            }else{
                this.onSaveError()
            }
            }    
        )
    }    
    
    cloneServiceKey(serviceKey: ServiceKeys) {
        const serviceKeyForClone = new ServiceKeys(
            serviceKey.id,
            serviceKey.key,
            serviceKey.value,
            serviceKey.serviceKeysId,
            );
        this.serviceKeys.push(serviceKeyForClone);
    }
    private onSaveSuccess(result: IServiceKeys, isCreate: boolean, i: number) {
        (result as any).isRequired = this.requiredServiceKey.find((rsk) => rsk.name === this.service.type).serviceKeys.some((sk) => sk.serviceKeyName === result.key);

        if (isCreate) {
            (result as any).isDisabled = true;
            this.serviceKeys.splice(i, 1, result);
        } else {
            //this.serviceKeys.find((k) => k.id === result.id).isDisabled = true;
        }
        this.mapServiceKeysKeys();
        this.eventManager.broadcast({ name: 'serviceKeysUpdated', content: 'OK' });
    }

    private onSaveError() {
        this.isSaving = false;
    }

    trackId(index: number, item: IServiceKeys) {
        return item.id;
    }

    registerChangeInServiceKeys() {
        this.eventSubscriber = this.eventManager.subscribe('serviceKeysListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
export interface RequiredServiceKey {
    name: string;
    serviceKeys: Array<ServiceKeyInformation>;
}
export interface ServiceKeyInformation {
    serviceKeyName: string;
    valueType: string;
    placeholder: string;
}
