import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Address, IAddress } from 'app/shared/model/address.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueueDeleteDialogComponent } from 'app/entities/queue/queue-delete-dialog.component';
import { QueueClearDialogComponent } from 'app/entities/queue/queue-clear-dialog.component';
import { TopicDeleteDialogComponent } from 'app/entities/topic/topic-delete-dialog.component';
import { TopicClearDialogComponent } from 'app/entities/topic/topic-clear-dialog.component';
import { OverflowActionDirective, PrimaryActionDirective, RowActions, Truncate } from 'app/shared/table';

@Component({
  selector: '[jhi-address-row]',
  templateUrl: './address-row.component.html',
  imports: [RouterModule, FontAwesomeModule, NgbDropdownModule, RowActions, PrimaryActionDirective, OverflowActionDirective, Truncate],
})
export class AddressRowComponent {
  @Input() address: Address;
  @Input() brokerType: string;
  @Input() endpointType: 'queue' | 'topic' = 'queue';

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private eventManager: EventManager,
  ) {}

  get clearLabel(): string {
    return this.endpointType === 'topic' && this.brokerType === 'classic' ? 'Reset' : 'Clear';
  }

  delete(address: IAddress): void {
    const dialog = this.endpointType === 'queue' ? QueueDeleteDialogComponent : TopicDeleteDialogComponent;
    const modalRef = this.modalService.open(dialog);
    modalRef.componentInstance.address = address;
    modalRef.componentInstance.brokerType = this.brokerType;
    modalRef.result.then(
      () => this.broadcastDeleted(),
      reason => {
        if (reason === true) {
          this.broadcastDeleted();
        }
      },
    );
  }

  clear(address: IAddress): void {
    const dialog = this.endpointType === 'queue' ? QueueClearDialogComponent : TopicClearDialogComponent;
    const modalRef = this.modalService.open(dialog);
    modalRef.componentInstance.address = address;
    modalRef.componentInstance.brokerType = this.brokerType;
  }

  navigateToMessageSender(addressName: string) {
    this.router.navigate(['../broker/sender/message-sender'], {
      queryParams: { endpointName: addressName, endpointType: this.endpointType, brokerType: this.brokerType },
    });
  }

  navigateToMessageBrowser(addressName: string) {
    this.router.navigate(['../broker/browser/message-browser'], {
      queryParams: { endpointName: addressName, endpointType: this.endpointType, brokerType: this.brokerType },
    });
  }

  private broadcastDeleted(): void {
    const eventName = this.endpointType === 'queue' ? 'queueDeleted' : 'topicDeleted';
    this.eventManager.broadcast(new EventWithContent(eventName, this.address));
  }
}
