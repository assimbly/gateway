import { Component, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Service } from './service.model';
import { ServiceService } from './service.service';
import { ServiceKeysComponent, ServiceKeysService, ServiceKeys } from '../../entities/service-keys';
import { Principal, ResponseWrapper } from '../../shared';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'jhi-service',
    templateUrl: './service.component.html',
        entryComponents: [
            ServiceKeysComponent
            ],
})

export class ServiceComponent implements OnInit, OnDestroy, OnChanges {
    public services: Array<Service> = [];
    currentAccount: any;
    eventSubscriber: Subscription;
    serviceKey: ServiceKeys;
    serviceKeys: Array<ServiceKeys>;
    service: Service;
    type: any;
    isSaving: boolean;
    disabledServiceType= true;
    selectedService: Service = new Service();
    typeServices: string[] = ['JDBC Connection', 'SonicMQ Connection', 'ActiveMQ Connection', 'MQ Connection'];

    constructor(
        private serviceService: ServiceService,
        private serviceKeysService: ServiceKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
                if (this.services.length > 0) {
                    this.selectedService = this.services[this.services.length - 1];
                    this.filterServiceKeys();
                }
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
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
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        if (this.serviceKey !== undefined ) {
            this.eventManager.subscribe('serviceKeyDeleted', (res) => this.updateServiceKeys(res.content))
        }else {
            this.eventManager.subscribe('serviceKeyDeleted', (res) => res.content)
        }
        this.registerChangeInServices();
    }
    updateServiceKeys(id: number) {
        this.serviceKeys = this.serviceKeys.filter((x) => x.id === id);
        const newServiceKeys = new ServiceKeys();
        this.serviceKeys.push(newServiceKeys);
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    filterServiceKeys() {
        if (this.selectedService === null) {
            this.selectedService = new Service();
        } else {
            this.serviceKeysService.query().subscribe(
                (res: ResponseWrapper) => {
                    this.serviceKeys = res.json;
                    this.serviceKeys = this.serviceKeys.filter((k) => k.serviceId === this.selectedService.id);
                    if (this.serviceKeys.length === 0) {
                        const newServiceKeys = new ServiceKeys();
                        newServiceKeys.isDisabled = false;
                        this.serviceKeys.push(newServiceKeys);
                    }
                },
                (res: ResponseWrapper) => this.onError(res.json)
            );
        }
    }
    saveServiceType(service: Service) {
        this.isSaving = true;
            this.subscribeToSaveResponse(
                this.serviceService.update(service));
                this.disabledServiceType = true;
            }
    private subscribeToSaveResponse(result: Observable<Service>) {
        result.subscribe((res: Service) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }
    private onSaveSuccess(result: Service) {
        this.isSaving = false;
    }

    edit() {
        this.disabledServiceType = false;
    }
    private onSaveError() {
        this.isSaving = false;
    }
    trackId(index: number, item: Service) {
        return item.id;
    }
    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('serviceListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
