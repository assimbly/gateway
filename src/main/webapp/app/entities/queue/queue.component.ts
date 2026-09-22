import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SortState } from 'app/shared/sort';

import { AccountService } from 'app/core/auth/account.service';

import { IQueue } from 'app/shared/model/queue.model';
import { IAddress } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { SearchToolbar } from 'app/shared/filter';
import { DataTable, DataTableColumn } from 'app/shared/table';
import { QueueRowComponent } from './queue-row.component';
import { QueueSearchByNamePipe } from './queue.searchbyname.pipe';

@Component({
  selector: 'jhi-queue',
  templateUrl: './queue.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, SearchToolbar, DataTable, QueueRowComponent],
})
export class QueueComponent implements OnInit, OnDestroy {
  queues: IQueue[] = [];
  addresses: IAddress[] = [];
  brokers: IBroker[] = [];
  eventSubscriber?: Subscription;
  currentAccount: any;
  itemsPerPage: number;
  links: any;
  page: number;
  sortState: SortState = { predicate: 'name', order: 'desc' };
  timeInterval: Subscription;
  isBroker: boolean | undefined;

  searchQueueText = '';
  brokerType = '';
  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'numberOfConsumers', header: 'Consumers', sortable: true, numeric: true },
    { key: 'numberOfMessages', header: 'Messages', sortable: true, numeric: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];
  private readonly searchPipe = new QueueSearchByNamePipe();

  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor(
    protected queueService: QueueService,
    protected alertService: AlertService,
    protected eventManager: EventManager,
    protected modalService: NgbModal,
    protected accountService: AccountService,
  ) {
    this.queues = [];
    this.brokers = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
  }

  reset(): void {
    this.page = 0;
    this.updateAllQueues();
  }

  loadPage(page: number): void {
    this.page = page;
    this.getBrokerType();
  }

  ngOnInit(): void {
    this.registerChangeInQueues();
    this.registerDeletedQueues();
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });
  }

  ngAfterViewInit() {
    this.getBrokerType();
    this.poll();
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
    this.timeInterval.unsubscribe();
  }

  get filteredAddresses(): IAddress[] {
    return this.searchPipe.transform(this.addresses ?? [], this.searchQueueText, this.sortState.order === 'asc', this.sortState.predicate);
  }

  trackId(index: number, item: IAddress): number {
    return item.id!;
  }

  registerChangeInQueues(): void {
    this.eventSubscriber = this.eventManager.subscribe('queueListModification', () => this.reset());
  }

  poll(): void {
    this.timeInterval = interval(10000).subscribe(x => {
      this.updateAllQueues();
    });
  }

  registerDeletedQueues() {
    this.eventManager.subscribe('queueDeleted', res => {
      this.getBrokerType();
    });
  }

  delete(queue: IQueue): void {
    const modalRef = this.modalService.open(QueueDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.queue = queue;
  }

  sort(): string[] {
    const { predicate, order } = this.sortState;
    const result = [predicate + ',' + order];
    if (predicate !== 'name') {
      result.push('name');
    }
    return result;
  }

  getBrokerType() {
    this.queueService.getBrokers().subscribe(
      data => {
        if (data) {
          for (let i = 0; i < data.body.length; i++) {
            this.brokers.push(data.body[i]);
          }

          if (this.brokers[0]) {
            this.isBroker = true;

            this.brokerType = this.brokers[0].type;
            if (this.brokerType != null) {
              this.getAllQueues();
            }
          } else {
            this.isBroker = false;
          }
          this.changeDetector.detectChanges();
        }
      },
      error => console.log(error)
    );
  }

  getAllQueues() {
    this.addresses = [];

    if (this.isBroker) {
      this.queueService.getAllQueues(this.brokerType).subscribe(
        data => {
          if (data && data.body.queues) {
            this.isBroker = true;
            if (data.body.queues.queue) {
              for (let i = 0; i < data.body.queues.queue.length; i++) {
                if (data.body.queues.queue[i].temporary.toString() === 'false') {
                  this.addresses.push(data.body.queues.queue[i]);
                }
              }
            }
          } else {
            this.isBroker = false;
          }
          this.changeDetector.detectChanges();
        },
        error => {
          console.log(error);
          this.isBroker = false;
          this.changeDetector.detectChanges();
        }
      );
    }
  }

  updateAllQueues() {
    if (this.isBroker) {
      this.queueService.getAllQueues(this.brokerType).subscribe(
        data => {
          if (data && data.body.queues) {
            this.isBroker = true;
            if (data.body.queues.queue) {
              for (let i = 0; i < data.body.queues.queue.length; i++) {
                // exclude temporary queues
                if (data.body.queues.queue[i].temporary.toString() === 'false') {
                  this.addresses.splice(i, 1, data.body.queues.queue[i]);
                }
              }
              this.addresses = [...this.addresses];
            }
          } else {
            this.isBroker = false;
          }
          this.changeDetector.detectChanges();
        },
        error => {
          console.log(error);
          this.isBroker = false;
          this.changeDetector.detectChanges();
        }
      );
    }
  }

  protected onError(errorMessage: string) {
	this.alertService.addAlert({
	  type: 'danger',
	  message: errorMessage,
	});
  }
}
