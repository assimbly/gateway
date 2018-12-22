import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ErrorEndpoint } from './error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-error-endpoint',
    templateUrl: './error-endpoint.component.html'
})
export class ErrorEndpointComponent implements OnInit, OnDestroy {
errorEndpoints: ErrorEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private errorEndpointService: ErrorEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.errorEndpointService.query().subscribe(
            (res: ResponseWrapper) => {
                this.errorEndpoints = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInErrorEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: ErrorEndpoint) {
        return item.id;
    }
    registerChangeInErrorEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('errorEndpointListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
