import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

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
    public headers: Header[];
    currentAccount: any;
    eventSubscriber: Subscription;
    headerKeys: Array<HeaderKeys>
    headerKey: HeaderKeys;
    selectedHeaderId: number;
    lastInArray: any;

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
                this.lastInArray = this.headers[this.headers.length - 1];
                this.selectedHeaderId = this.lastInArray.id;
                this.filterHeaderKeys( this.lastInArray.id);
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        if (this.headerKey !== undefined ) {
            this.eventManager.subscribe('headerKeyDeleted', (res) => this.updateHeaderKeys(res.content))
        }else {
            this.eventManager.subscribe('headerKeyDeleted', (res) => res.content)
        }
        this.registerChangeInHeaders();
        this.selectOption(this.selectedHeaderId);
    }

    updateHeaderKeys(id: number) {
        this.headerKeys = this.headerKeys.filter((x) => x.id === id);
        const newHeaderKeys = new HeaderKeys();
        this.headerKeys.push(newHeaderKeys);
    }
    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    filterHeaderKeys(id) {
        this.headerKeysService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headerKeys = res.json;
                this.headerKeys = this.headerKeys.filter((k) => k.headerId === id);
                if (this.headerKeys.length === 0) {
                    const newHeaderKeys = new HeaderKeys();
                    newHeaderKeys.isDisabled = false;
                    this.headerKeys.push(newHeaderKeys);
                }
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
      this.filterHeaderKeys(this.selectedHeaderId);
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
