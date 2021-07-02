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

    ngOnInit() {
        //         this.setFlowStatusDefaults();
        //         this.getStatus(this.flow.id);
        //         this.endpoints = this.flow.endpoints;
        //         this.getEndpoints();
        //
        //         this.registerTriggeredAction();
    }

    ngAfterViewInit() {
        //         this.connection = this.flowService.connectionStomp();
        //         this.stompClient = this.flowService.client();
        //         this.subscribe('alert');
        //         this.subscribe('event');
        //         this.receive().subscribe(data => {
        //             const data2 = data.split(':');
        //
        //             if (Array.isArray(data2) || data2.length) {
        //                 if (data2[0] === 'event') {
        //                     this.setFlowStatus(data2[1]);
        //                 } else if (data2[0] === 'alert') {
        //                     const alertId = Number(data2[1]);
        //                     if (this.flow.id === alertId) {
        //                         this.getFlowNumberOfAlerts(alertId);
        //                     }
        //                 }
        //             }
        //         });
    }

    ngOnDestroy() {
        //         this.flowService.unsubscribe();
        //         if (this.mySubscription) {
        //             this.mySubscription.unsubscribe();
        //         }
    }
    //
    //     navigateToFlow(action: string) {
    //         switch (action) {
    //             case 'edit':
    //                 this.isAdmin
    //                     ? this.router.navigate(['../../flow/edit-all', this.flow.id, { mode: 'edit' }])
    //                     : this.router.navigate(['../flow', this.flow.id]);
    //                 break;
    //             case 'clone':
    //                 this.isAdmin
    //                     ? this.router.navigate(['../../flow/edit-all', this.flow.id, { mode: 'clone' }])
    //                     : this.router.navigate(['../flow', this.flow.id]);
    //                 break;
    //             case 'delete':
    //                 if (this.isAdmin) {
    //                     let modalRef = this.modalService.open(FlowDeleteDialogComponent as any);
    //                     if (typeof FlowDeleteDialogComponent as Component) {
    //                         modalRef.componentInstance.flow = this.flow;
    //                         modalRef.result.then(
    //                             result => {
    //                                 this.eventManager.broadcast({ name: 'flowDeleted', content: this.flow });
    //                                 modalRef = null;
    //                             },
    //                             reason => {
    //                                 this.eventManager.broadcast({ name: 'flowDeleted', content: this.flow });
    //                                 modalRef = null;
    //                             }
    //                         );
    //                     }
    //                 } else {
    //                     this.router.navigate(['../flow', this.flow.id]);
    //                 }
    //
    //                 //this.router.navigate([{ outlets: { popup: 'flow/' + this.flow.id + '/delete' } }], { replaceUrl: true, queryParamsHandling: 'merge' }) :
    //                 //this.router.navigate(['../flow', this.flow.id]);
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }

    //     navigateToEndpoint(endpoint: Endpoint) {
    //         this.isAdmin
    //             ? this.router.navigate(['../../flow/edit-all', this.flow.id], { queryParams: { mode: 'edit', endpointid: endpoint.id } })
    //             : this.router.navigate(['../flow', this.flow.id]);
    //     }

    subscribe(type) {
        //         const topic = '/topic/' + this.flow.id + '/' + type;
        //
        //         this.connection.then(() => {
        //             this.subscriber = this.stompClient.subscribe(topic, data => {
        //                 if (!this.listenerObserver) {
        //                     this.listener = this.createListener();
        //                 }
        //                 this.listenerObserver.next(data.body);
        //             });
        //         });
    }

    unsubscribe() {
        //         if (this.subscriber !== null) {
        //             this.subscriber.unsubscribe();
        //         }
        //         this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }
}
