import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Address, IAddress } from 'app/shared/model/address.model';

import { QueueService } from './queue.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { NavigationEnd, Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QueueDeleteDialogComponent } from 'app/entities/queue/queue-delete-dialog.component';
import { QueueClearDialogComponent } from 'app/entities/queue/queue-clear-dialog.component';

@Component({
  standalone: false,
  selector: '[jhi-queue-row]',
  templateUrl: './queue-row.component.html',
})
export class QueueRowComponent implements OnInit, OnDestroy {
  @Input() address: Address;
  @Input() brokerType: string;

  mySubscription: Subscription;

  queueRowID: string;

  modalRef: NgbModalRef | null;

  constructor(
    private queueService: QueueService,
    private modalService: NgbModal,
    private router: Router,
    private eventManager: EventManager,
  ) {
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

  delete(address: IAddress): void {
    let modalRef = this.modalService.open(QueueDeleteDialogComponent as any);
    modalRef.componentInstance.address = address;
    modalRef.result.then(
      result => {
		this.eventManager.broadcast(new EventWithContent('queueDeleted', this.address));
        modalRef = null;
      },
      reason => {
		this.eventManager.broadcast(new EventWithContent('queueDeleted', this.address));
        modalRef = null;
      }
    );
  }

  clear(address: IAddress): void {
    const modalRef = this.modalService.open(QueueClearDialogComponent as any);
    modalRef.componentInstance.address = address;
  }

  navigateToMessageSender(addressName: string) {
    this.router.navigate(['../broker/sender/message-sender'], {queryParams: { endpointName: addressName, endpointType: 'queue', brokerType: this.brokerType }});
  }

  navigateToMessageBrowser(addressName: string) {
    this.router.navigate(['../broker/browser/message-browser' ], {queryParams:{ endpointName: addressName, endpointType: 'queue', brokerType: this.brokerType }});
  }
}
