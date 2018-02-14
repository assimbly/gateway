import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ToEndpoint } from './to-endpoint.model';
import { ToEndpointService } from './to-endpoint.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-to-endpoint',
    templateUrl: './to-endpoint.component.html'
})
export class ToEndpointComponent implements OnInit, OnDestroy {
toEndpoints: ToEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private toEndpointService: ToEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.toEndpointService.query().subscribe(
            (res: ResponseWrapper) => {
                this.toEndpoints = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInToEndpoints();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: ToEndpoint) {
        return item.id;
    }
    registerChangeInToEndpoints() {
        this.eventSubscriber = this.eventManager.subscribe('toEndpointListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
