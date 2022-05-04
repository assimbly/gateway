import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { ServiceDeleteDialogComponent } from './service-delete-dialog.component';
import { IService, Service } from 'app/shared/model/service.model';
import { ServiceService } from './service.service';
import { Subscription } from 'rxjs';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-service-all',
  templateUrl: './service-all.component.html',
})
export class ServiceAllComponent implements OnInit, OnDestroy {
  public services: Array<Service> = [];
  public page: any;
  private currentAccount: any;
  private eventSubscriber: Subscription;
  predicate: any;
  reverse: any;

  constructor(
    protected serviceService: ServiceService,
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
    this.eventSubscriber = this.eventManager.subscribe('serviceListModification', response => this.loadAll());
  }

  private loadAll() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
    this.serviceService
      .query({
        page: this.page,
        sort: this.sort(),
      })
      .subscribe(
        res => {
          this.services = res.body;
        },
        res => this.onError(res)
      );
  }
  
  delete(service: IService): void {
		const modalRef = this.modalService.open(ServiceDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.service = service;
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
    this.services = [];
    this.loadAll();
  }
}
