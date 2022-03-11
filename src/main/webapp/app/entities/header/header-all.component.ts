import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { HeaderDeleteDialogComponent } from './header-delete-dialog.component';
import { IHeaderKeys, HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderService } from './header.service';
import { Subscription } from 'rxjs';
import { IHeader } from 'app/shared/model/header.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-header-all',
  templateUrl: './header-all.component.html',
})
export class HeaderAllComponent implements OnInit, OnDestroy {
  public headers: IHeader[] = [];
  public page: any;
  private eventSubscriber: Subscription;
  private currentAccount: any;
  predicate: any;
  reverse: any;

  constructor(
    protected headerService: HeaderService,
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
    this.registerChangeInHeaders();
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
    this.headers = [];
    this.loadAll();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  private loadAll() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.headerService
      .query({
        page: this.page,
        sort: this.sort(),
      })
      .subscribe(
        res => {
          this.headers = res.body;
        },
        res => this.onError(res.body)
      );
  }
  
  	delete(header: IHeader): void {
		const modalRef = this.modalService.open(HeaderDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.header = header;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

  private registerChangeInHeaders() {
    this.eventSubscriber = this.eventManager.subscribe('headerListModification', () => this.loadAll());
  }

  private onError(error) {
            this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
  }
}
