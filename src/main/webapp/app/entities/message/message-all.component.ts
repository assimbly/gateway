import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { MessageDeleteDialogComponent } from './message-delete-dialog.component';
import { MessageService } from './message.service';
import { Subscription } from 'rxjs';
import { IMessage } from 'app/shared/model/message.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  standalone: false,
  selector: 'jhi-message-all',
  templateUrl: './message-all.component.html',
})
export class MessageAllComponent implements OnInit, OnDestroy {
  public messages: IMessage[] = [];
  public page: any;
  private eventSubscriber: Subscription;
  private currentAccount: any;
  predicate: any;
  reverse: any;

  constructor(
    protected messageService: MessageService,
    protected alertService: AlertService,
	protected modalService: NgbModal,
    protected eventManager: EventManager,
    protected accountService: AccountService
  ) {
    this.page = 0;
    this.predicate = 'name';
    this.reverse = true;
  }

  ngOnInit() {
    this.loadAll();
    this.registerChangeInMessages();
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'name') {
      result.push('name');
    }
    return result;
  }

  reset() {
    this.page = 0;
    this.messages = [];
    this.loadAll();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  private loadAll() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.messageService
      .query({
        page: this.page,
        sort: this.sort(),
      })
      .subscribe(
        res => {
          this.messages = res.body;
        },
        res => this.onError(res.body)
      );
  }

  	delete(message: IMessage): void {
		const modalRef = this.modalService.open(MessageDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.message = message;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

  private registerChangeInMessages() {
    this.eventSubscriber = this.eventManager.subscribe('messageListModification', () => this.loadAll());
  }

  private onError(error) {
            this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
  }
}
