import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IServiceKeys } from 'app/shared/model/service-keys.model';
import { AccountService } from 'app/core';
import { ServiceKeysService } from './service-keys.service';

@Component({
    selector: 'jhi-service-keys',
    templateUrl: './service-keys.component.html'
})
export class ServiceKeysComponent implements OnInit, OnDestroy {
    serviceKeys: IServiceKeys[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected serviceKeysService: ServiceKeysService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.serviceKeysService.query().subscribe(
            (res: HttpResponse<IServiceKeys[]>) => {
                this.serviceKeys = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInServiceKeys();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
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
