import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { IMessage } from 'app/shared/model/message.model';
import { IHeader, Header } from 'app/shared/model/header.model';
import { AccountService } from 'app/core/auth/account.service';
import { MessageService } from './message.service';
import { HeaderComponent } from '../../entities/header/header.component';
import { HeaderService } from '../../entities/header/header.service';

@Component({
    selector: 'jhi-message',
    templateUrl: './message.component.html',
})
export class MessageComponent implements OnInit, OnDestroy {
    messages: IMessage[];
    currentAccount: any;
    eventSubscriber: Subscription;
    headers: Array<IHeader>;
    header: IHeader;
    selectedMessageId: number;

    constructor(
        protected messageService: MessageService,
        protected headerService: HeaderService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.messageService.query().subscribe(
            (res: HttpResponse<IMessage[]>) => {
                this.messages = res.body;
                if (this.messages.length > 0) {
                    this.selectedMessageId = this.messages[this.messages.length - 1].id;
                    this.filterHeader(this.selectedMessageId);
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        if (this.header !== undefined) {
            this.eventManager.subscribe('headerDeleted', res => this.updateHeader(parseInt(res.toString())));
        } else {
            this.eventManager.subscribe('headerDeleted', res => res);
        }
        this.registerChangeInMessages();
        this.selectOption();
    }

    updateHeader(id: number) {
        this.headers = this.headers.filter(x => x.id === id);
        const newHeader = new Header();
        this.headers.push(newHeader);
    }
    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    filterHeader(id) {
        this.headerService.query().subscribe(
            res => {
                this.headers = res.body;
                this.headers = this.headers.filter(k => k.messageId === id);
                if (this.headers.length === 0) {
                    const newHeader = new Header();
                    newHeader.isDisabled = false;
                    this.headers.push(newHeader);
                }
            },
            res => this.onError(res.json)
        );
    }

    trackId(index: number, item: IMessage) {
        return item.id;
    }

    registerChangeInMessages() {
        this.eventSubscriber = this.eventManager.subscribe('messageListModification', response => this.loadAll());
    }

    selectOption() {
        this.filterHeader(this.selectedMessageId);
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		    type: 'danger',
		    message: errorMessage,
		});
    }
}
