import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { Observable } from 'rxjs';

import { IHeader, Header } from 'app/shared/model/header.model';
import { HeaderDeleteDialogComponent } from '././header-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnChanges {
    @Input() headers: IHeader[];
    @Input() messageId: number;

    headersArray: Array<string> = [];
    headerSelected: boolean;
    selectedId: number;
    isSaving: boolean;
    header: IHeader;
    headerId: number;
    languageHeader: string[] = ['constant', 'groovy', 'jsonpath', 'csimple', 'simple', 'spel', 'xpath'];
    typeHeader: string[] = ['header', 'property'];
    eventSubscriber: Subscription;

    constructor(
        protected headerService: HeaderService,
        protected alertService: AlertService,
		protected modalService: NgbModal,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.headerService.query().subscribe(
            (res: HttpResponse<IHeader[]>) => {
                this.headers = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.eventManager.subscribe('headerDeleted', res => this.updateHeader(parseInt(res.toString())));
    }

	deleteHeader(header: IHeader): void {
		const modalRef = this.modalService.open(HeaderDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.header = header;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

    updateHeader(id: number) {
        this.headers = this.headers.filter(x => x.id !== id);
        this.mapHeaders();
        if (this.headers.length === 0) {
            this.addHeader();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.mapHeaders();
        if (changes['headers'] && this.headers !== undefined) {
            if (this.headers.length === 1 && this.headers[0].id === undefined) {
                this.headers[0].isDisabled = false;
                this.headers[0].type = this.typeHeader[0];
                this.headers[0].language = this.languageHeader[0];
            } else {
                this.headers.forEach(header => {
                    header.isDisabled = true;
                });
            }
        }
    }
    save(header: IHeader, i: number) {
        this.isSaving = true;
        if (header.id) {
            this.subscribeToSaveResponse(this.headerService.update(header), false, i);
        } else {
            header.messageId = this.messageId;
            this.subscribeToSaveResponse(this.headerService.create(header), true, i);
        }
    }

    private mapHeaders() {
        if (typeof this.headers !== 'undefined') {
            this.headersArray = this.headers.map(sk => sk.key);
            this.headersArray = this.headersArray.filter(k => k !== undefined);
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IHeader>>, closePopup, i: number) {
        result.subscribe(data => {
            if (data.ok) {
                this.onSaveSuccess(data.body, closePopup, i);
            } else {
                this.onSaveError();
            }
        });
    }

    private onSaveSuccess(result: IHeader, isCreate: boolean, i: number) {
        if (isCreate) {
            result.isDisabled = true;
            this.headers.splice(i, 1, result);
        } else {
            // this.headers.find(k => k.id === result.id).isDisabled = true;
        }
	    this.eventManager.broadcast(new EventWithContent('headerUpdated', 'OK'));
    }

    private onSaveError() {
        this.isSaving = false;
    }

    editHeader(header) {
        header.isDisabled = false;
    }

    cloneHeader(header: IHeader) {
        const headerForClone = new Header(header.messageId, header.key, header.value, header.type, header.language, header.messageId);
        this.headers.push(headerForClone);
    }

    addHeader() {
        const newHeader = new Header();
        newHeader.isDisabled = false;
        newHeader.type = this.typeHeader[0];
        newHeader.language = this.languageHeader[0];
        this.headers.push(newHeader);
        this.mapHeaders();
    }

    removeHeader(i: number) {
        this.headers.splice(i, 1);
        this.mapHeaders();
        if (this.headers.length === 0) {
            this.addHeader();
        }
    }

    trackId(index: number, item: IHeader) {
        return item.id;
    }

    registerChangeInHeader() {
        this.eventSubscriber = this.eventManager.subscribe('headerListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
