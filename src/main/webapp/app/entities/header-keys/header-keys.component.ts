import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { HeaderKeys } from './header-keys.model';
import { HeaderKeysService } from './header-keys.service';
import { Principal, ResponseWrapper } from '../../shared';
import { Header, HeaderService } from '../header';

@Component({
    selector: 'jhi-header-keys',
    templateUrl: './header-keys.component.html'
})
export class HeaderKeysComponent implements OnInit, OnDestroy {
    @Input() headerKeys: HeaderKeys[];
    currentAccount: any;
    eventSubscriber: Subscription;
    // @Input() headerId: number;

    constructor(
        private headerService: HeaderService,
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    /*
    loadAll() {
        this.headerService.query().subscribe(
            (headers: ResponseWrapper) => {
                // this.headerId = headers.json[0].id;
                this.filterHeaderKeys(headers.json[0].id);
                 this.headerKeysService.query().subscribe(
                    (res: ResponseWrapper) => {
                        this.headerKeys = res.json;
                        this.headerKeys = this.headerKeys.filter((k) => k.headerId === this.header.id);
                    },
                    (res: ResponseWrapper) => this.onError(res.json)
                );
            },
            (headers: ResponseWrapper) => this.onError(headers.json)
        );
    }
    */

    /*filterHeaderKeys(id) {
        this.headerKeysService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headerKeys = res.json;
                this.headerKeys = this.headerKeys.filter((k) => k.headerId === id);
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }*/

    ngOnInit() {
        // this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        // this.registerChangeInHeaderKeys();
        this.eventManager.subscribe('headerKeysUpdated', (response) => this.headerKeys = [response]);
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: HeaderKeys) {
        return item.id;
    }
    /*registerChangeInHeaderKeys() {
        this.eventSubscriber = this.eventManager.subscribe('headerKeysListModification', (response) => this.loadAll());
    }*/

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
