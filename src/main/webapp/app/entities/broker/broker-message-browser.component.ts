import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { ActivatedRoute } from '@angular/router';

import { IMessage } from 'app/shared/model/messsage.model';
import { AccountService } from 'app/core';

import { ITEMS_PER_PAGE } from 'app/shared';
import { BrokerService } from 'app/entities/broker/broker.service';

@Component({
    selector: 'jhi-broker-message-browser',
    templateUrl: './broker-message-browser.component.html'
})
export class BrokerMessageBrowserComponent implements OnInit, OnDestroy {
    messages: IMessage[];
    message: IMessage;
    selectedMessage: IMessage = {};
    selectedHighlight: string;
    headers: any;

    brokerType: string;
    endpointName: string;
    endpointType: string;

    public isAdmin: boolean;
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number = -1;
    numberOfMessages: number = 100;
    finished = false;

    test: any;
    searchText: string = '';
    active: string = '0';
    descending: boolean = false;
    objectKeys = Object.keys;

    constructor(
        private brokerService: BrokerService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected parseLinks: JhiParseLinks,
        protected accountService: AccountService,
        private route: ActivatedRoute
    ) {
        this.messages = [];
        this.itemsPerPage = ITEMS_PER_PAGE + 5;
        this.page = 1;
        this.links = {
            last: 0
        };
        this.predicate = 'name';
        this.reverse = true;
    }

    ngOnInit() {
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.loadMessages();
        this.finished = true;
        this.accountService.hasAuthority('ROLE_ADMIN').then(r => (this.isAdmin = r));
        this.registerChangeInFlows();
    }

    ngAfterViewInit() {
        this.finished = true;
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    loadMessages() {
        this.route.params.subscribe(params => {
            this.endpointType = params['endpointType'];
            this.endpointName = params['endpointName'];
        });

        this.brokerService.getBrokerType(1).subscribe(
            data => {
                if (data) {
                    this.brokerType = data.body;
                } else {
                    this.brokerType = 'classic';
                }
                this.brokerService.browseMessages(this.brokerType, this.endpointName, this.page, this.numberOfMessages).subscribe(
                    (res: HttpResponse<IMessage[]>) => this.onSuccess(res.body, res.headers),
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
            },
            error => console.log(error)
        );
    }

    private onSuccess(data, headers) {
        this.messages = new Array<IMessage>();

        let itemNumber = 0;

        for (var i = data.messages.message.length - 1; i > -1; i--) {
            this.message = {};

            itemNumber = itemNumber + 1;
            this.message.number = itemNumber;
            this.message.messageid = data.messages.message[i].JMSMessageID;
            this.message.timestamp = data.messages.message[i].JMSTimestamp;

            this.messages.push(this.message);

            if (i === data.messages.message.length - 1) {
                this.showMessage(this.message);
            }
        }

        this.totalItems = this.numberOfMessages;
    }

    private onSuccessBrowse(data, headers) {
        if (data.messages.message) {
            for (var i = 0; i < data.messages.message.length; i++) {
                this.selectedMessage = {};
                this.selectedMessage.body = data.messages.message[i].Text;
                this.selectedMessage.headers = data.messages.message[i].headers;
            }
        }
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    reset() {
        this.page = 0;
        this.messages = [];
        this.loadMessages();
    }

    loadPage(page) {
        this.page = 1; // page;
        this.itemsPerPage = this.itemsPerPage + 5;
        this.loadMessages();
    }

    trackTimestamp(index: number, item: IMessage) {
        return item.timestamp;
    }

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe('messageListModification', response => this.reset());
    }

    sortByTimestamp() {
        if (this.descending) {
            this.messages.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            this.descending = false;
        } else {
            this.messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
            this.descending = true;
        }

        this.messages = [...this.messages];
    }

    trigerAction(selectedAction: string) {
        this.eventManager.broadcast({ name: 'trigerAction', content: selectedAction });
    }

    showMessage(message: IMessage) {
        this.selectedHighlight = message.messageid;
        this.brokerService.browseMessage(this.brokerType, this.endpointName, message.messageid).subscribe(
            (res: HttpResponse<IMessage[]>) => this.onSuccessBrowse(res.body, res.headers),
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
}
