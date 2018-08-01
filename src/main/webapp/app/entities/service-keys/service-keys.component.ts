import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ServiceKeys } from './service-keys.model';
import { Service } from '../service/service.model';
import { ServiceKeysService } from './service-keys.service';
import { Principal } from '../../shared';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'jhi-service-keys',
    templateUrl: './service-keys.component.html'
})
export class ServiceKeysComponent implements OnInit, OnChanges {
    @Input() serviceKeys: Array<ServiceKeys> = [];
    @Input() service: Service;

    serviceKeysKeys: Array<string> = [];
    currentAccount: any;
    isSaving: boolean;
    serviceKey: ServiceKeys;
    eventSubscriber: Subscription;
    requiredServiceKey: Array<RequiredServiceKey> = [];
    listVal: Array<String> = ['com.mysql.jdbc.Driver', 'org.postgresql.Driver'];

    constructor(
        private serviceKeysService: ServiceKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }
    ngOnInit() {
        this.addRequiredServiceKeys();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
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
                        placeholder: 'jdbc:mysql://localhost/dbname'
                    },
                    {
                        serviceKeyName: 'username',
                        valueType: 'text',
                        placeholder: 'admin'
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
                        placeholder: 'tcp://localhost:2506'
                    },
                    {
                        serviceKeyName: 'username',
                        valueType: 'text',
                        placeholder: 'Administrator'
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
                        placeholder: 'tcp://localhost:61616'
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
                this.serviceKeys[0].isDisabled = false;
                this.serviceKeys[0].isRequired = false;
            } else {
                this.serviceKeys.forEach((serviceKey) => {
                    serviceKey.isDisabled = true;
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
                rsk.valueType = sk.valueType;
                rsk.placeholder = sk.placeholder;
                rsk.isRequired = true;
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
            serviceKey.serviceId = this.service.id;
            this.subscribeToSaveResponse(
                this.serviceKeysService.create(serviceKey), true, i);
        }
    }
    addServiceKeys() {
        const newServiceKeys = new ServiceKeys();
        newServiceKeys.isDisabled = false;
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

    private subscribeToSaveResponse(result: Observable<ServiceKeys>, isCreate: boolean, i: number) {
        result.subscribe((res: ServiceKeys) =>
            this.onSaveSuccess(res, isCreate, i), (res: Response) => this.onSaveError());
    }
    cloneServiceKey(serviceKey: ServiceKeys) {
        const serviceKeyForClone = new ServiceKeys(
            null,
            serviceKey.key,
            serviceKey.value,
            null,
            false,
            true,
            null,
            null,
            serviceKey.serviceId);
        this.serviceKeys.push(serviceKeyForClone);
    }
    private onSaveSuccess(result: ServiceKeys, isCreate: boolean, i: number) {
        result.isRequired = this.requiredServiceKey.find((rsk) => rsk.name === this.service.type).serviceKeys.some((sk) => sk.serviceKeyName === result.key);

        if (isCreate) {
            result.isDisabled = true;
            this.serviceKeys.splice(i, 1, result);
        } else {
            this.serviceKeys.find((k) => k.id === result.id).isDisabled = true;
        }
        this.mapServiceKeysKeys();
        this.eventManager.broadcast({ name: 'serviceKeysUpdated', content: 'OK' });
    }

    private onSaveError() {
        this.isSaving = false;
    }

    trackId(index: number, item: ServiceKeys) {
        return item.id;
    }
    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
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
