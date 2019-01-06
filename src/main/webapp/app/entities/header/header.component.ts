import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { IHeader } from 'app/shared/model/header.model';
import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { AccountService } from 'app/core';
import { HeaderService } from './header.service';
import { HeaderKeysComponent, HeaderKeysService } from '../../entities/header-keys';

@Component({
    selector: 'jhi-header',
    templateUrl: './header.component.html',
        entryComponents: [
            HeaderKeysComponent
            ],
})
export class HeaderComponent implements OnInit, OnDestroy {
    headers: IHeader[];
    currentAccount: any;
    eventSubscriber: Subscription;
    headerKeys: Array<IHeaderKeys>
    headerKey: IHeaderKeys;
    selectedHeaderId: number;

    constructor(
        protected headerService: HeaderService,
        protected headerKeysService: HeaderKeysService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.headerService.query().subscribe(
            (res: HttpResponse<IHeader[]>) => {
                this.headers = res.body;
                if (this.headers.length > 0) {
                    this.selectedHeaderId = this.headers[this.headers.length - 1].id;
                    this.filterHeaderKeys(this.selectedHeaderId);
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        if (this.headerKey !== undefined ) {
            this.eventManager.subscribe('headerKeyDeleted', (res) => this.updateHeaderKeys(res.content))
        }else {
            this.eventManager.subscribe('headerKeyDeleted', (res) => res.content)
        }
        this.registerChangeInHeaders();
        this.selectOption();
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
            (res) => {
                this.headerKeys = res.body;
                this.headerKeys = this.headerKeys.filter((k) => k.headerId === id);
                if (this.headerKeys.length === 0) {
                    const newHeaderKeys = new HeaderKeys();
                    newHeaderKeys.isDisabled = false;
                    this.headerKeys.push(newHeaderKeys);
                }
            },
            (res) => this.onError(res.json)
        );
    }

    trackId(index: number, item: IHeader) {
        return item.id;
    }

    registerChangeInHeaders() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', response => this.loadAll());
    }

    selectOption() {
      this.filterHeaderKeys(this.selectedHeaderId);
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
