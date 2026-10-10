import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { EventManager } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SortState, sortParams } from 'app/shared/sort';

import { AccountService } from 'app/core/auth/account.service';

import { ITopic } from 'app/shared/model/topic.model';
import { IAddress } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { TopicService } from './topic.service';
import { TopicDeleteDialogComponent } from './topic-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { SearchToolbar } from 'app/shared/filter';
import { EndpointTypeSwitch } from 'app/shared/endpoint-switch';
import { DataTable, DataTableColumn } from 'app/shared/table';
import { AddressRowComponent } from 'app/entities/broker/address-row.component';
import { filterAddresses } from 'app/shared/util/address-filter';

@Component({
  selector: 'jhi-topic',
  templateUrl: './topic.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, SearchToolbar, EndpointTypeSwitch, DataTable, AddressRowComponent],
})
export class TopicComponent implements OnInit, OnDestroy {

  topics: ITopic[] = [];
  addresses: IAddress[] = [];
  brokers: IBroker[] = [];
  eventSubscriber = new Subscription();
  currentAccount: any;
  itemsPerPage: number;
  links: any;
  page: number;
  sortState: SortState = { predicate: 'name', order: 'desc' };

  timeInterval: Subscription;
  isBroker: boolean | undefined;

  searchTopicText: string = '';
  brokerType = '';
  readonly columns: DataTableColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'numberOfConsumers', header: 'Consumers', sortable: true, numeric: true },
    { key: 'numberOfMessages', header: 'Messages', sortable: true, numeric: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor(
    protected topicService: TopicService,
    protected alertService: AlertService,
    protected eventManager: EventManager,
    protected modalService: NgbModal,
    protected accountService: AccountService
  ) {
    this.topics = [];
    this.brokers = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
  }

  ngOnInit(): void {
    this.registerChangeInTopics();
    this.registerDeletedTopics();

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
    this.timeInterval.unsubscribe();
  }


  reset(): void {
    this.page = 0;
    this.getBrokerType();
  }

  loadPage(page: number): void {
    this.page = page;
    this.getBrokerType();
  }

  get filteredAddresses(): IAddress[] {
    return filterAddresses(this.addresses, this.searchTopicText, this.sortState.order === 'asc', this.sortState.predicate ?? 'name', true);
  }

  trackId(index: number, item: IAddress): number {
    return item.id!;
  }

  registerChangeInTopics(): void {
    this.eventSubscriber.add(this.eventManager.subscribe('topicListModification', () => this.reset()));
  }

  poll(): void {
    this.timeInterval = interval(10000).subscribe(x => {
      this.updateAllTopics();
    });
  }

  registerDeletedTopics() {
    this.eventSubscriber.add(
      this.eventManager.subscribe('topicDeleted', () => {
        this.getBrokerType();
      }),
    );
  }

  delete(topic: ITopic): void {
    const modalRef = this.modalService.open(TopicDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.topic = topic;
  }

  sort(): string[] {
    return sortParams(this.sortState);
  }

  getBrokerType() {
    this.topicService.getBrokers().subscribe(
      data => {
        if (data) {
          for (let i = 0; i < data.body.length; i++) {
            this.brokers.push(data.body[i]);
          }
          if (this.brokers[0]) {
            this.isBroker = true;
            this.brokerType = this.brokers[0].type;
            if (this.brokerType != null) {
              this.getAllTopics();
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

  getAllTopics() {
    this.addresses = [];

    if (this.isBroker) {
      this.topicService.getAllTopics(this.brokerType).subscribe(
        data => {
          if (data && data.body.topics) {
            this.isBroker = true;
            if (data.body.topics.topic) {
              for (const address of data.body.topics.topic) {
                if (address.temporary.toString() === 'false') {
                  this.addresses.push(address);
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

  updateAllTopics() {
    if (this.isBroker) {
      this.topicService.getAllTopics(this.brokerType).subscribe(
        data => {
          if (data && data.body.topics) {
            this.isBroker = true;
            if (data.body.topics.topic) {
              for (let i = 0; i < data.body.topics.topic.length; i++) {
                if (data.body.topics.topic[i].temporary.toString() === 'false') {
                  this.addresses.splice(i, 1, data.body.topics.topic[i]);
                }
              }
              this.addresses = [...this.addresses];
            }
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
