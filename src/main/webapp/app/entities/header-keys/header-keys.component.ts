import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { HeaderKeys } from './header-keys.model';
import { HeaderKeysService } from './header-keys.service';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-header-keys',
    templateUrl: './header-keys.component.html'
})
export class HeaderKeysComponent implements OnInit, OnDestroy {
headerKeys: HeaderKeys[];
    currentAccount: any;
    eventSubscriber: Subscription;
    @Input() headerId: number;

    constructor(
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.headerKeysService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headerKeys = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInHeaderKeys();
        this.eventManager.subscribe('headerKeysUpdated', (response) => this.headerKeys = [response]);

    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: HeaderKeys) {
        return item.id;
    }
    registerChangeInHeaderKeys() {
        this.eventSubscriber = this.eventManager.subscribe('headerKeysListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
