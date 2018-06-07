import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ServiceKeys } from './service-keys.model';
import { ServiceKeysService } from './service-keys.service';
import { Principal, ResponseWrapper } from '../../shared';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'jhi-service-keys',
    templateUrl: './service-keys.component.html'
})
export class ServiceKeysComponent implements OnInit, OnChanges {
    @Input() serviceKeys: ServiceKeys[];
    @Input() serviceId: number;
    // serviceKeys: ServiceKeys[];
    currentAccount: any;
    isSaving: boolean;
    serviceKey: ServiceKeys;
    eventSubscriber: Subscription;

    constructor(
        private serviceKeysService: ServiceKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }
    ngOnInit() {
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.eventManager.subscribe('serviceKeyDeleted', (res) => this.updateServiceKeys(res.content))
    }
    updateServiceKeys(id: number) {
        this.serviceKeys = this.serviceKeys.filter((x) => x.id !== id);
        if (this.serviceKeys.length === 0) {
            this.addServiceKeys();
        }
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['serviceKeys'] && this.serviceKeys !== undefined) {
            if (this.serviceKeys.length === 1 && this.serviceKeys[0].id === undefined) {
                this.serviceKeys[0].isDisabled = false;
            } else {
                this.serviceKeys.forEach((serviceKey) => {
                    serviceKey.isDisabled = true;
                });
            }
        }
    }
    save(serviceKey: ServiceKeys) {
        this.isSaving = true;
        if (!!serviceKey.id) {
            this.subscribeToSaveResponse(
                this.serviceKeysService.update(serviceKey), false);
        } else {
            serviceKey.serviceId = this.serviceId;
            this.subscribeToSaveResponse(
                this.serviceKeysService.create(serviceKey), true);
        }
    }
    addServiceKeys() {
        const newServiceKeys = new ServiceKeys();
        newServiceKeys.isDisabled = false;
        this.serviceKeys.push(newServiceKeys);
    }

    removeServiceKeys() {
        const i = this.serviceKeys.indexOf(new ServiceKeys());
        this.serviceKeys.splice(i, 1);
        if (this.serviceKeys.length === 0) {
            this.addServiceKeys();
        }
    }
    editServiceKey(serviceKey) {
        serviceKey.isDisabled = false;
    }
    private subscribeToSaveResponse(result: Observable<ServiceKeys>, isCreate: boolean) {
        result.subscribe((res: ServiceKeys) =>
            this.onSaveSuccess(res, isCreate), (res: Response) => this.onSaveError());
    }
    cloneServiceKey(serviceKey: ServiceKeys) {
        const serviceKeyForClone = new ServiceKeys(
            null,
            serviceKey.key,
            serviceKey.value,
            null,
            false,
            serviceKey.serviceId);
        this.serviceKeys.push(serviceKeyForClone);
    }
    private onSaveSuccess(result: ServiceKeys, isCreate: boolean) {
        if (isCreate) {
            this.serviceKeys = this.serviceKeys.filter((x) => !!x.id);
            result.isDisabled = true;
            this.serviceKeys.push(result);
        } else {
            this.serviceKeys.find((k) => k.id === result.id).isDisabled = true;
        }
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
