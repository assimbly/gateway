import { Component, OnInit, OnDestroy } from '@angular/core';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { Service } from './service.model';
import { ServiceService } from './service.service';
import { Principal, ResponseWrapper } from '../../shared';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'jhi-service-all',
    templateUrl: './service-all.component.html'
})

export class ServiceAllComponent implements OnInit, OnDestroy {
    public services: Array<Service> = [];
    public page: any;
    private currentAccount: any;
    private eventSubscriber: Subscription;

    constructor(
        private serviceService: ServiceService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    ngOnInit() {
        this.loadAllServices();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInServices();
    }

    reset() {
        this.page = 0;
        this.services = [];
        this.loadAllServices();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    private registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('serviceListModification', (response) => this.loadAllServices());
    }

    private loadAllServices() {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
