import { Component, OnInit, OnDestroy } from '@angular/core';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { Header } from './header.model';
import { HeaderService } from './header.service';
import { Principal, ResponseWrapper } from '../../shared';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'jhi-header-all',
    templateUrl: './header-all.component.html'
})

export class HeaderAllComponent implements OnInit, OnDestroy {
    public headers: Array<Header> = [];
    public page: any;
    public isAdmin: boolean;
    private eventSubscriber: Subscription;
    private currentAccount: any;
    predicate: any;
    reverse: any;

    constructor(
        private headerService: HeaderService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    ngOnInit() {
        this.loadAllHeaders();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.isAdmin = this.principal.isAdmin();
        this.registerChangeInHeaders();
    }

    reset() {
        this.page = 0;
        this.headers = [];
        this.loadAllHeaders();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    private loadAllHeaders() {
        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    private registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', () => this.loadAllHeaders());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
