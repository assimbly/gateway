import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ServiceKeys } from './service-keys.model';
import { ServiceKeysService } from './service-keys.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-service-keys',
    templateUrl: './service-keys.component.html'
})
export class ServiceKeysComponent implements OnInit, OnDestroy {
serviceKeys: ServiceKeys[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private serviceKeysService: ServiceKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.serviceKeysService.query().subscribe(
            (res: ResponseWrapper) => {
                this.serviceKeys = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInServiceKeys();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: ServiceKeys) {
        return item.id;
    }
    registerChangeInServiceKeys() {
        this.eventSubscriber = this.eventManager.subscribe('serviceKeysListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
