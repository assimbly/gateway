import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { Observable } from 'rxjs';

import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderKeysDeleteDialogComponent } from '././header-keys-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { HeaderKeysService } from './header-keys.service';

@Component({
    selector: 'jhi-header-keys',
    templateUrl: './header-keys.component.html'
})
export class HeaderKeysComponent implements OnInit, OnChanges {
    @Input() headerKeys: IHeaderKeys[];
    @Input() headerId: number;

    headerKeysKeys: Array<string> = [];
    headerKeySelected: boolean;
    selectedId: number;
    isSaving: boolean;
    headerKey: IHeaderKeys;
    headerKeyId: number;
    typeHeader: string[] = ['constant', 'groovy', 'jsonpath', 'csimple', 'simple', 'spel', 'xpath'];
    eventSubscriber: Subscription;

    constructor(
        protected headerKeysService: HeaderKeysService,
        protected alertService: AlertService,
		protected modalService: NgbModal,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

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
        this.eventManager.subscribe('headerKeyDeleted', res => this.updateHeaderKeys(parseInt(res.toString())));
    }

	delete(headerKey: IHeaderKeys): void {
		const modalRef = this.modalService.open(HeaderKeysDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.headerKey = headerKey;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}
	
    updateHeaderKeys(id: number) {
        this.headerKeys = this.headerKeys.filter(x => x.id !== id);
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
                this.headerKeys.forEach(headerKey => {
                    headerKey.isDisabled = true;
                });
            }
        }
    }
    save(headerKey: IHeaderKeys, i: number) {
        this.isSaving = true;
        if (headerKey.id) {
            this.subscribeToSaveResponse(this.headerKeysService.update(headerKey), false, i);
        } else {
            headerKey.headerId = this.headerId;
            this.subscribeToSaveResponse(this.headerKeysService.create(headerKey), true, i);
        }
    }

    private mapHeaderKeysKeys() {
        if (typeof this.headerKeys !== 'undefined') {
            this.headerKeysKeys = this.headerKeys.map(sk => sk.key);
            this.headerKeysKeys = this.headerKeysKeys.filter(k => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IHeaderKeys>>, closePopup, i: number) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, closePopup, i);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: IHeaderKeys, isCreate: boolean, i: number) {
        if (isCreate) {
            result.isDisabled = true;
            this.headerKeys.splice(i, 1, result);
        } else {
            // this.headerKeys.find(k => k.id === result.id).isDisabled = true;
        }
	    this.eventManager.broadcast(new EventWithContent('headerKeysUpdated', 'OK'));
    }

    private onSaveError() {
        this.isSaving = false;
    }

    editHeaderKey(headerKey) {
        headerKey.isDisabled = false;
    }

    cloneHeaderKey(headerKey: IHeaderKeys) {
        const headerKeyForClone = new HeaderKeys(headerKey.headerId, headerKey.key, headerKey.value, headerKey.type, headerKey.headerId);
        this.headerKeys.push(headerKeyForClone);
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

    trackId(index: number, item: IHeaderKeys) {
        return item.id;
    }

    registerChangeInHeaderKeys() {
        this.eventSubscriber = this.eventManager.subscribe('headerKeysListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
