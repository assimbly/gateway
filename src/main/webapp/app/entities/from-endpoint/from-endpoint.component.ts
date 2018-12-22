import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { AccountService } from 'app/core';
import { FromEndpointService } from './from-endpoint.service';

@Component({
    selector: 'jhi-from-endpoint',
    templateUrl: './from-endpoint.component.html'
})
export class FromEndpointComponent implements OnInit, OnDestroy {
    fromEndpoints: IFromEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected fromEndpointService: FromEndpointService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.fromEndpointService.query().subscribe(
            (res: HttpResponse<IFromEndpoint[]>) => {
                this.fromEndpoints = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInFromEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IFromEndpoint) {
        return item.id;
    }

    registerChangeInFromEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('fromEndpointListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
