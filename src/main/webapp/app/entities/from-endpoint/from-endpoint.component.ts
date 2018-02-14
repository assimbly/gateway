import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { FromEndpoint } from './from-endpoint.model';
import { FromEndpointService } from './from-endpoint.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-from-endpoint',
    templateUrl: './from-endpoint.component.html'
})
export class FromEndpointComponent implements OnInit, OnDestroy {
fromEndpoints: FromEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private fromEndpointService: FromEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.fromEndpointService.query().subscribe(
            (res: ResponseWrapper) => {
                this.fromEndpoints = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInFromEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: FromEndpoint) {
        return item.id;
    }
    registerChangeInFromEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('fromEndpointListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
