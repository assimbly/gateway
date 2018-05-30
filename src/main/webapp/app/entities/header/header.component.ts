import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Header } from './header.model';
import { HeaderService } from './header.service';
import { HeaderKeysComponent, HeaderKeysService, HeaderKeys } from '../../entities/header-keys';
import { Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-header',
    templateUrl: './header.component.html',
        entryComponents: [
            HeaderKeysComponent
            ],
})

export class HeaderComponent implements OnInit, OnDestroy {
    headers: Header[];
    currentAccount: any;
    eventSubscriber: Subscription;
    headerKeys: Array<HeaderKeys>
    selectedHeaderId: number;

    constructor(
        private headerService: HeaderService,
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
                this.selectedHeaderId = this.headers[0].id;
                this.filterHeaderKeys(this.headers[0].id);
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInHeaders();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    filterHeaderKeys(id) {
        this.headerKeysService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headerKeys = res.json;
                this.headerKeys = this.headerKeys.filter((k) => k.headerId === id);
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    trackId(index: number, item: Header) {
        return item.id;
    }
    registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', (response) => this.loadAll());
    }

    selectOption(e) {
        // this.eventManager.broadcast({ name: 'headerSelected', content: this.selectedHeaderId });
        this.filterHeaderKeys(this.selectedHeaderId);
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
