import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Queue, IQueue } from 'app/shared/model/queue.model';
import { Address, IAddress, IAddresses } from 'app/shared/model/address.model';

import { QueueService } from './queue.service';
import { SecurityService } from '../security';
import { JhiEventManager } from 'ng-jhipster';
import { LoginModalService } from 'app/core';

import { NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin, Observable, Observer, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QueueDeleteDialogComponent } from 'app/entities/queue/queue-delete-dialog.component';
import { QueueClearDialogComponent } from 'app/entities/queue/queue-clear-dialog.component';
import { FlowDeleteDialogComponent } from 'app/entities/flow';

enum Status {
    active = 'active',
    paused = 'paused',
    inactive = 'inactive',
    inactiveError = 'inactiveError'
}
@Component({
    selector: '[jhi-queue-row]',
    templateUrl: './queue-row.component.html'
})
export class QueueRowComponent implements OnInit, OnDestroy {
    sslUrl: any;
    mySubscription: Subscription;

    @Input() address: Address;
    @Input() isAdmin: boolean;
    public clickButton = false;
    public showNumberOfItems: number;

    queueRowID: string;

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

    constructor(
        private queueService: QueueService,
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
        const modalRef = this.modalService.open(QueueDeleteDialogComponent as any);
        modalRef.componentInstance.address = address;
    }

    clear(address: IAddress): void {
        const modalRef = this.modalService.open(QueueClearDialogComponent as any);
        modalRef.componentInstance.address = address;
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }

    navigateToMessageSender(addressName: string) {
        this.router.navigate(['../broker/message-sender', { endpointName: addressName, endpointType: 'queue' }]);
    }

    navigateToMessageBrowser(addressName: string) {
        this.router.navigate(['../broker/message-browser', { endpointName: addressName, endpointType: 'queue' }]);
    }
}
