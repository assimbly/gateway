import { Component, DestroyRef, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { EventManager } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SortState, sortParams } from 'app/shared/sort';

import { AccountService } from 'app/core/auth/account.service';

import { IQueue } from 'app/shared/model/queue.model';
import { IAddress } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { QueueService } from './queue.service';
import { QueueDeleteDialogComponent } from './queue-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { SearchToolbar } from 'app/shared/filter';
import { EndpointTypeSwitch, EndpointsEmptyState } from 'app/shared/endpoint-switch';
import { DataTable, DataTableColumn } from 'app/shared/table';
import { AddressRowComponent } from 'app/entities/broker/address-row.component';
import { AddressTotalsRowComponent } from 'app/entities/broker/address-totals-row.component';
import { filterAddresses } from 'app/shared/util/address-filter';

@Component({
  selector: 'jhi-queue',
  templateUrl: './queue.component.html',
  imports: [
    RouterModule,
    FontAwesomeModule,
    SearchToolbar,
    EndpointTypeSwitch,
    EndpointsEmptyState,
    DataTable,
    AddressRowComponent,
    AddressTotalsRowComponent,
  ],
})
export class QueueComponent implements OnInit, OnDestroy {
  protected queueService = inject(QueueService);
  protected alertService = inject(AlertService);
  protected eventManager = inject(EventManager);
  protected modalService = inject(NgbModal);
  protected accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);

  queues: IQueue[] = [];
  readonly addresses = signal<IAddress[]>([]);
  readonly brokers = signal<IBroker[]>([]);
  eventSubscriber = new Subscription();
  currentAccount: any;
  itemsPerPage: number;
  links: any;
  page: number;
  readonly sortState = signal<SortState>({ predicate: 'name', order: 'asc' });
  readonly isBroker = signal<boolean | undefined>(undefined);
  /** Whether the Queues of the Broker have been asked for, so an empty list is known to be empty. */
  readonly addressesLoaded = signal(false);

  readonly searchQueueText = signal('');
  readonly brokerType = signal('');
  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'numberOfConsumers', header: 'Consumers', sortable: true, numeric: true },
    { key: 'numberOfMessages', header: 'Messages', sortable: true, numeric: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  constructor() {
    this.queues = [];
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
    this.eventSubscriber.unsubscribe();
  }

  /** Without a running Broker, or without any Queue, the list gives way to an explanation of Endpoints and what to do first. */
  readonly showEmptyState = computed(() => {
    if (this.isBroker() === undefined) {
      return false;
    }
    return !this.isBroker() || (this.addressesLoaded() && !this.addresses().length);
  });

  readonly filteredAddresses = computed(() => {
    const { order, predicate } = this.sortState();
    return filterAddresses(this.addresses(), this.searchQueueText(), order === 'asc', predicate ?? 'name');
  });

  registerChangeInQueues(): void {
    this.eventSubscriber.add(this.eventManager.subscribe('queueListModification', () => this.updateAllQueues()));
  }

  poll(): void {
    interval(10000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateAllQueues());
  }

  registerDeletedQueues() {
    this.eventSubscriber.add(
      this.eventManager.subscribe('queueDeleted', () => {
        this.getBrokerType();
      }),
    );
  }

  delete(queue: IQueue): void {
    const modalRef = this.modalService.open(QueueDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.queue = queue;
  }

  sort(): string[] {
    return sortParams(this.sortState());
  }

  getBrokerType() {
    this.queueService.getBrokers().subscribe(data => {
      if (data) {
        const brokers = data.body ?? [];
        this.brokers.set(brokers);
        if (brokers[0]) {
          this.isBroker.set(true);
          this.brokerType.set(brokers[0].type!);
          if (this.brokerType() != null) {
            this.getAllQueues();
          }
        } else {
          this.isBroker.set(false);
        }
      }
    });
  }

  getAllQueues() {
    this.addresses.set([]);
    this.addressesLoaded.set(false);

    if (this.isBroker()) {
      this.queueService.getAllQueues(this.brokerType()).subscribe(
        data => {
          this.addressesLoaded.set(true);
          if (data && data.body!.queues) {
            this.isBroker.set(true);
            this.addresses.set((data.body!.queues.queue ?? []).filter(queue => queue.temporary!.toString() === 'false'));
          } else {
            this.isBroker.set(false);
          }
        },
        error => {
          this.addressesLoaded.set(true);
          this.isBroker.set(false);
        },
      );
    }
  }

  updateAllQueues() {
    if (this.isBroker()) {
      this.queueService.getAllQueues(this.brokerType()).subscribe(
        data => {
          if (data && data.body!.queues) {
            this.isBroker.set(true);
            // Replace the whole list, so Queues deleted on the Broker drop out of the table.
            this.addresses.set((data.body!.queues.queue ?? []).filter(queue => queue.temporary!.toString() === 'false'));
          } else {
            this.isBroker.set(false);
          }
        },
        error => {
          this.isBroker.set(false);
        },
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
