import { Component, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { IService, Service } from 'app/shared/model/service.model';
import { ServiceKeys } from 'app/shared/model/service-keys.model';
import { AccountService } from 'app/core/auth/account.service';
import { ServiceService } from './service.service';
import { ServiceKeysComponent } from '../../entities/service-keys/service-keys.component';
import { ServiceKeysService } from '../../entities/service-keys/service-keys.service';
import { Services } from '../../shared/camel/service-connections';
import { Observable } from 'rxjs';

@Component({
    selector: 'jhi-service',
    templateUrl: './service.component.html',
    entryComponents: [ServiceKeysComponent]
})
export class ServiceComponent implements OnInit, OnDestroy, OnChanges {
    [x: string]: any;
    services: IService[];
    currentAccount: any;
    eventSubscriber: Subscription;
    serviceKey: ServiceKeys;
    serviceKeys: Array<ServiceKeys>;
    service: Service;
    type: any;
    isSaving: boolean;
    disabledServiceType = true;
    selectedService: Service = new Service();

    constructor(
        protected serviceService: ServiceService,
        protected alertService: AlertService,
        public servicesLists: Services,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.serviceService.query().subscribe(
            (res: HttpResponse<IService[]>) => {
                this.services = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['serviceKeys'] && this.serviceKeys !== undefined) {
            if (this.serviceKeys.length === 1 && this.serviceKeys[0].id === undefined) {
                this.serviceKeys[0].isDisabled = false;
            } else {
                this.serviceKeys.forEach(serviceKey => {
                    serviceKey.isDisabled = true;
                });
            }
        }
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        if (this.serviceKey !== undefined) {
            this.eventManager.subscribe('serviceKeyDeleted', res => this.updateServiceKeys(parseInt(res.toString())));
        } else {
            this.eventManager.subscribe('serviceKeyDeleted', res => res);
        }
        this.registerChangeInServices();
    }
    updateServiceKeys(id: number) {
        this.serviceKeys = this.serviceKeys.filter(x => x.id === id);
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
                res => {
                    this.serviceKeys = res.json;
                    this.serviceKeys = this.serviceKeys.filter(k => k.serviceId === this.selectedService.id);
                    if (this.serviceKeys.length === 0) {
                        const newServiceKeys = new ServiceKeys();
                        newServiceKeys.isDisabled = false;
                        this.serviceKeys.push(newServiceKeys);
                    }
                },
                res => this.onError(res.json)
            );
        }
    }

    saveServiceType(service: Service) {
        this.isSaving = true;
        this.subscribeToSaveResponse(this.serviceService.update(service));
        this.disabledServiceType = true;
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IService>>) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body);
            } else {
                this.onSaveError();
            }
        });
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
        this.eventSubscriber = this.eventManager.subscribe('serviceListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
