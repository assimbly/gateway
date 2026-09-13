import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SortDirective, SortByDirective, SortState } from 'app/shared/sort';

import { MessageDeleteDialogComponent } from './message-delete-dialog.component';
import { MessageService } from './message.service';
import { Subscription } from 'rxjs';
import { IMessage } from 'app/shared/model/message.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-message-all',
  templateUrl: './message-all.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, InfiniteScrollModule, SortDirective, SortByDirective],
})
export class MessageAllComponent implements OnInit, OnDestroy {
  public messages: IMessage[] = [];
  public page: any;
  private eventSubscriber: Subscription;
  private currentAccount: any;
  sortState: SortState = { predicate: 'name', order: 'asc' };

  constructor(
    protected messageService: MessageService,
    protected alertService: AlertService,
	protected modalService: NgbModal,
    protected eventManager: EventManager,
    protected accountService: AccountService
  ) {
    this.page = 0;
  }

  ngOnInit() {
    this.loadAll();
    this.registerChangeInMessages();
  }

  sort(): string[] {
    const { predicate, order } = this.sortState;
    const result = [predicate + ',' + order];
    if (predicate !== 'name') {
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
