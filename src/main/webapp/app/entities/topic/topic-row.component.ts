import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Address, IAddress, IAddresses } from 'app/shared/model/address.model';

import { TopicService } from './topic.service';
import { SecurityService } from '../security';
import { JhiEventManager } from 'ng-jhipster';
import { LoginModalService } from 'app/core';

import { NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin, Observable, Observer, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TopicDeleteDialogComponent } from 'app/entities/topic/topic-delete-dialog.component';
import { TopicClearDialogComponent } from 'app/entities/topic/topic-clear-dialog.component';

enum Status {
    active = 'active',
    paused = 'paused',
    inactive = 'inactive',
    inactiveError = 'inactiveError'
}
@Component({
    selector: '[jhi-topic-row]',
    templateUrl: './topic-row.component.html'
})
export class TopicRowComponent implements OnInit, OnDestroy {
    sslUrl: any;
    mySubscription: Subscription;

    @Input() address: Address;
    @Input() isAdmin: boolean;
    public clickButton = false;
    public showNumberOfItems: number;

    topicRowID: string;

    intervalTime: any;

    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;

    alreadyConnectedOnce = false;
    private subscription: Subscription;

    modalRef: NgbModalRef | null;
    changeText: boolean;

    constructor(
        private topicService: TopicService,
        private securityService: SecurityService,
        private loginModalService: LoginModalService,
        private modalService: NgbModal,
        private router: Router,
        private eventManager: JhiEventManager
    ) {
        this.listener = this.createListener();

        this.router.routeReuseStrategy.shouldReuseRoute = function() {
            return false;
        };

        this.mySubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // Trick the Router into believing it's last link wasn't previously loaded
                this.router.navigated = false;
            }
        });
    }

    ngOnInit() {}

    ngOnDestroy() {}

    subscribe(type) {}

    unsubscribe() {}

    delete(address: IAddress): void {
        let modalRef = this.modalService.open(TopicDeleteDialogComponent as any);
        modalRef.componentInstance.address = address;
        modalRef.result.then(
            result => {
                this.eventManager.broadcast({ name: 'topicDeleted', content: this.address });
                modalRef = null;
            },
            reason => {
                this.eventManager.broadcast({ name: 'topicDeleted', content: this.address });
                modalRef = null;
            }
        );
    }

    clear(address: IAddress): void {
        const modalRef = this.modalService.open(TopicClearDialogComponent as any);
        modalRef.componentInstance.address = address;
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }

    navigateToMessageSender(addressName: string) {
        this.router.navigate(['../broker/message-sender', { endpointName: addressName, endpointType: 'topic' }]);
    }

    navigateToMessageBrowser(addressName: string) {
        this.router.navigate(['../broker/message-browser', { endpointName: addressName, endpointType: 'topic' }]);
    }

    downloadMessages() {}
}
