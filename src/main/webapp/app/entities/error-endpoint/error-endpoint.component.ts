import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { AccountService } from 'app/core';
import { ErrorEndpointService } from './error-endpoint.service';

@Component({
    selector: 'jhi-error-endpoint',
    templateUrl: './error-endpoint.component.html'
})
export class ErrorEndpointComponent implements OnInit, OnDestroy {
    errorEndpoints: IErrorEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected errorEndpointService: ErrorEndpointService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.errorEndpointService.query().subscribe(
            (res: HttpResponse<IErrorEndpoint[]>) => {
                this.errorEndpoints = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInErrorEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IErrorEndpoint) {
        return item.id;
    }

    registerChangeInErrorEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('errorEndpointListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
