import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Service } from './service.model';
import { ServiceService } from './service.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-service',
    templateUrl: './service.component.html'
})
export class ServiceComponent implements OnInit, OnDestroy {
services: Service[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private serviceService: ServiceService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInServices();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
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
