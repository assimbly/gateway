import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IToEndpoint } from 'app/shared/model/to-endpoint.model';
import { AccountService } from 'app/core';
import { ToEndpointService } from './to-endpoint.service';

@Component({
    selector: 'jhi-to-endpoint',
    templateUrl: './to-endpoint.component.html'
})
export class ToEndpointComponent implements OnInit, OnDestroy {
    toEndpoints: IToEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected toEndpointService: ToEndpointService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.toEndpointService.query().subscribe(
            (res: HttpResponse<IToEndpoint[]>) => {
                this.toEndpoints = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInToEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IToEndpoint) {
        return item.id;
    }

    registerChangeInToEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('toEndpointListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
