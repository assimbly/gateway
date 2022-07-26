import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Address, IAddress } from 'app/shared/model/address.model';

import { TopicService } from './topic.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

import { NavigationEnd, Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TopicDeleteDialogComponent } from 'app/entities/topic/topic-delete-dialog.component';
import { TopicClearDialogComponent } from 'app/entities/topic/topic-clear-dialog.component';

@Component({
  selector: '[jhi-topic-row]',
  templateUrl: './topic-row.component.html',
})
export class TopicRowComponent implements OnInit, OnDestroy {
  mySubscription: Subscription;

  @Input() address: Address;
  @Input() brokerType: string;

  topicRowID: string;

  modalRef: NgbModalRef | null;

  constructor(
    private topicService: TopicService,
    private modalService: NgbModal,
    private router: Router,
    private eventManager: EventManager
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
    let modalRef = this.modalService.open(TopicDeleteDialogComponent as any);
    modalRef.componentInstance.address = address;
    modalRef.result.then(
      result => {
		this.eventManager.broadcast(new EventWithContent('topicDeleted', this.address));
        modalRef = null;
      },
      reason => {
		this.eventManager.broadcast(new EventWithContent('topicDeleted', this.address));
        modalRef = null;
      }
    );
  }

  clear(address: IAddress): void {
    const modalRef = this.modalService.open(TopicClearDialogComponent as any);
    modalRef.componentInstance.address = address;
  }

  navigateToMessageSender(addressName: string) {
    this.router.navigate(['../broker/sender/message-sender', { stepName: addressName, stepType: 'topic', brokerType: this.brokerType }]);
  }

  navigateToMessageBrowser(addressName: string) {
    this.router.navigate(['../broker/browser/message-browser', { stepName: addressName, stepType: 'topic', brokerType: this.brokerType }]);
  }
}
