import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Address, IAddress } from 'app/shared/model/address.model';

import { QueueService } from './queue.service';
import { SecurityService } from 'app/entities/security/security.service';
import { JhiEventManager } from 'ng-jhipster';

import { NavigationEnd, Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QueueDeleteDialogComponent } from 'app/entities/queue/queue-delete-dialog.component';
import { QueueClearDialogComponent } from 'app/entities/queue/queue-clear-dialog.component';

@Component({
  selector: '[jhi-queue-row]',
  templateUrl: './queue-row.component.html',
})
export class QueueRowComponent implements OnInit, OnDestroy {
  @Input() address: Address;
  @Input() brokerType: string;

  mySubscription: Subscription;

  queueRowID: string;

  connection: Promise<any>;
  listener: Observable<any>;
  listenerObserver: Observer<any>;

  modalRef: NgbModalRef | null;

  constructor(
    private queueService: QueueService,
    private securityService: SecurityService,
    private modalService: NgbModal,
    private router: Router,
    private eventManager: JhiEventManager
  ) {
    this.listener = this.createListener();

    this.router.routeReuseStrategy.shouldReuseRoute = function () {
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
    let modalRef = this.modalService.open(QueueDeleteDialogComponent as any);
    modalRef.componentInstance.address = address;
    modalRef.result.then(
      result => {
        this.eventManager.broadcast({ name: 'queueDeleted', content: this.address });
        modalRef = null;
      },
      reason => {
        this.eventManager.broadcast({ name: 'queueDeleted', content: this.address });
        modalRef = null;
      }
    );
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
    this.router.navigate(['../broker/message-sender', { endpointName: addressName, endpointType: 'queue', brokerType: this.brokerType }]);
  }

  navigateToMessageBrowser(addressName: string) {
    this.router.navigate(['../broker/message-browser', { endpointName: addressName, endpointType: 'queue', brokerType: this.brokerType }]);
  }
}
