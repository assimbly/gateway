import { Component, OnInit, OnDestroy } from '@angular/core';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { IService, Service } from 'app/shared/model/service.model';
import { ServiceService } from './service.service';
import { Subscription } from 'rxjs';
import { AccountService } from "app/core";

@Component({
    selector: 'jhi-service-all',
    templateUrl: './service-all.component.html'
})

export class ServiceAllComponent implements OnInit, OnDestroy {
    public services: Array<Service> = [];
    public page: any;
    public isAdmin: boolean;
    private currentAccount: any;
    private eventSubscriber: Subscription;
    predicate: any;
    reverse: any;

    constructor(
            protected serviceService: ServiceService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {
    }

    ngOnInit() {
        this.loadAllServices();
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
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.isAdmin = this.accountService.isAdmin();
        this.serviceService.query().subscribe(
            (res) => {
                this.services = res.body;
            },
            (res) => this.onError(res)
        );
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
