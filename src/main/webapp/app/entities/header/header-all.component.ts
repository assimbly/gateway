import { Component, OnInit, OnDestroy } from '@angular/core';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderService } from './header.service';
import { Subscription } from 'rxjs';
import { IHeader } from "app/shared/model/header.model";

@Component({
    selector: 'jhi-header-all',
    templateUrl: './header-all.component.html'
})

export class HeaderAllComponent implements OnInit, OnDestroy {
    public headers: Array<IHeader> = [];
    public page: any;
    public isAdmin: boolean;
    private eventSubscriber: Subscription;
    private currentAccount: any;
    predicate: any;
    reverse: any;

    constructor(
        private headerService: HeaderService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.loadAllHeaders();
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
            (res) => {
                this.headers = res.body;
            },
            (res) => this.onError(res.body)
        );
    }

    private registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', () => this.loadAllHeaders());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
