import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IEndpoint } from 'app/shared/model/endpoint.model';
import { AccountService } from 'app/core/auth/account.service';
import { EndpointService } from './endpoint.service';

@Component({
    selector: 'jhi-endpoint',
    templateUrl: './endpoint.component.html'
})
export class EndpointComponent implements OnInit, OnDestroy {
    endpoints: IEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected endpointService: EndpointService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.endpointService.query().subscribe(
            (res: HttpResponse<IEndpoint[]>) => {
                this.endpoints = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IEndpoint) {
        return item.id;
    }

    registerChangeInEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('endpointListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
