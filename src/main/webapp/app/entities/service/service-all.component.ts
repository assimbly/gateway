import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

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
    protected eventManager: EventManager,
    protected accountService: AccountService
  ) {
    this.page = 0;
    this.predicate = 'name';
    this.reverse = true;
  }

  ngOnInit() {
    this.loadAllServices();
    this.registerChangeInServices();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  private registerChangeInServices() {
    this.eventSubscriber = this.eventManager.subscribe('serviceListModification', response => this.loadAllServices());
  }

  private loadAllServices() {
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
    this.loadAllServices();
  }
}
