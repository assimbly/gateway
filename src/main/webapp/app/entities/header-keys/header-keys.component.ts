import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { Observable } from 'rxjs/Observable';

import { IHeaderKeys } from 'app/shared/model/header-keys.model';
import { AccountService } from 'app/core';
import { HeaderKeysService } from './header-keys.service';

@Component({
    selector: 'jhi-header-keys',
    templateUrl: './header-keys.component.html'
})
export class HeaderKeysComponent implements OnInit, OnChanges {
    @Input() headerKeys: HeaderKeys[];
    @Input() headerId: number;

    headerKeysKeys: Array<string> = [];
    currentAccount: any;
    headerKeySelected: boolean;
    selectedId: number;
    isSaving: boolean;
    headerKey: HeaderKeys;
    headerKeyId: number;
    typeHeader: string[] = ['constant', 'xpath'];

    constructor(
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
    ) {
    }

    loadAll() {
        this.headerKeysService.query().subscribe(
            (res: HttpResponse<IHeaderKeys[]>) => {
                this.headerKeys = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.eventManager.subscribe('headerKeyDeleted', (res) => this.updateHeaderKeys(res.content))
    }

    updateHeaderKeys(id: number) {
        this.headerKeys = this.headerKeys.filter((x) => x.id !== id);
        this.mapHeaderKeysKeys();
        if (this.headerKeys.length === 0) {
            this.addHeaderKeys();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.mapHeaderKeysKeys();
        if (changes['headerKeys'] && this.headerKeys !== undefined) {
            if (this.headerKeys.length === 1 && this.headerKeys[0].id === undefined) {
                this.headerKeys[0].isDisabled = false;
                this.headerKeys[0].type = this.typeHeader[0];
            } else {
                this.headerKeys.forEach((headerKey) => {
                    headerKey.isDisabled = true;
                });
            }
        }
    }
    save(headerKey: HeaderKeys, i: number) {
        this.isSaving = true;
        if (!!headerKey.id) {
            this.subscribeToSaveResponse(
                this.headerKeysService.update(headerKey), false, i);
        } else {
            headerKey.headerId = this.headerId;
            this.subscribeToSaveResponse(
                this.headerKeysService.create(headerKey), true, i);
        }
    }

    private mapHeaderKeysKeys() {
        if (typeof this.headerKeys !== 'undefined') {
            this.headerKeysKeys = this.headerKeys.map((sk) => sk.key);
            this.headerKeysKeys = this.headerKeysKeys.filter((k) => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HeaderKeys>, isCreate: boolean, i: number) {
        result.subscribe((res: HeaderKeys) =>
            this.onSaveSuccess(res, isCreate, i), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: HeaderKeys, isCreate: boolean, i: number) {
        if (isCreate) {
            result.isDisabled = true;
            this.headerKeys.splice(i, 1, result);
        } else {
            this.headerKeys.find((k) => k.id === result.id).isDisabled = true;
        }
        this.eventManager.broadcast({ name: 'headerKeysUpdated', content: 'OK' });
    }

    private onSaveError() {
        this.isSaving = false;
    }

    editHeaderKey(headerKey) {
        headerKey.isDisabled = false;
    }

    cloneHeaderKey(headerKey: HeaderKeys) {
        const headerKeyForClone = new HeaderKeys(
            null,
            headerKey.key,
            headerKey.value,
            headerKey.type,
            headerKey.headerId,
            false);
        this.headerKeys.push(headerKeyForClone);
    }

    trackId(index: number, item: IHeaderKeys) {
        return item.id;
    }

    addHeaderKeys() {
        const newHeaderKeys = new HeaderKeys();
        newHeaderKeys.isDisabled = false;
        newHeaderKeys.type = this.typeHeader[0];
        this.headerKeys.push(newHeaderKeys);
        this.mapHeaderKeysKeys();
    }

    removeHeaderKeys(i: number) {
        this.headerKeys.splice(i, 1);
        this.mapHeaderKeysKeys();
        if (this.headerKeys.length === 0) {
            this.addHeaderKeys();
        }
    }
    
    protected onError(error) {
        this.jhiAlertService.error(error.message, null, null);
        console.log(error.message);
    }
}
