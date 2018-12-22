import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IService } from 'app/shared/model/service.model';
import { AccountService } from 'app/core';
import { ServiceService } from './service.service';

@Component({
    selector: 'jhi-service',
    templateUrl: './service.component.html'
})
export class ServiceComponent implements OnInit, OnDestroy {
    services: IService[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected serviceService: ServiceService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
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

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInServices();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IService) {
        return item.id;
    }

    registerChangeInServices() {
        this.eventSubscriber = this.eventManager.subscribe('serviceListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
