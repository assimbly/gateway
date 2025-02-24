import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { ConnectionDeleteDialogComponent } from './connection-delete-dialog.component';
import { IConnection, Connection } from 'app/shared/model/connection.model';
import { ConnectionService } from './connection.service';
import { Subscription } from 'rxjs';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  standalone: false,
  selector: 'jhi-connection-all',
  templateUrl: './connection-all.component.html',
})
export class ConnectionAllComponent implements OnInit, OnDestroy {
  public connections: Array<Connection> = [];
  public page: any;
  private currentAccount: any;
  private eventSubscriber: Subscription;
  predicate: any;
  reverse: any;

  constructor(
    protected connectionService: ConnectionService,
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
    this.registerChangeInServices();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  private registerChangeInServices() {
    this.eventSubscriber = this.eventManager.subscribe('connectionListModification', response => this.loadAll());
  }

  private loadAll() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.connectionService
      .query({
        page: this.page,
        sort: this.sort(),
      })
      .subscribe(
        res => {
          this.connections = res.body;
        },
        res => this.onError(res)
      );
  }

  delete(connection: IConnection): void {
		const modalRef = this.modalService.open(ConnectionDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.connection = connection;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

  private onError(error) {
	this.alertService.addAlert({
	  type: 'danger',
	  message: error.message,
	});
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
    this.connections = [];
    this.loadAll();
  }
}
