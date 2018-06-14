import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { HeaderKeys } from './header-keys.model';
import { HeaderKeysService } from './header-keys.service';
import { Principal, ResponseWrapper } from '../../shared';
import { Header, HeaderService } from '../header';

@Component({
    selector: 'jhi-header-keys',
    templateUrl: './header-keys.component.html'
})
export class HeaderKeysComponent implements OnInit, OnChanges {
    @Input() headerKeys: HeaderKeys[];
    @Input() headerId: number;
    currentAccount: any;
    headerKeySelected: boolean;
    selectedId: number;
    isSaving: boolean;
    headerKey: HeaderKeys;
    headerKeyId: number;
    typeHeader: string[] = ['constant', 'xpath'];

    constructor(
        private headerService: HeaderService,
        private headerKeysService: HeaderKeysService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal,
        private router: Router
    ) {
    }
    ngOnInit() {
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.eventManager.subscribe('headerKeyDeleted', (res) => this.updateHeaderKeys(res.content))
    }

    updateHeaderKeys(id: number) {
        this.headerKeys = this.headerKeys.filter((x) => x.id !== id);
        if (this.headerKeys.length === 0) {
            this.addHeaderKeys();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
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

    trackId(index: number, item: HeaderKeys) {
        return item.id;
    }

    addHeaderKeys() {
        const newHeaderKeys = new HeaderKeys();
        newHeaderKeys.isDisabled = false;
        newHeaderKeys.type = this.typeHeader[0];
        this.headerKeys.push(newHeaderKeys);
    }

    removeHeaderKeys(i: number) {
        this.headerKeys.splice(i, 1);
        if (this.headerKeys.length === 0) {
            this.addHeaderKeys();
        }
    }
    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
        console.log(error.message);
    }
}
