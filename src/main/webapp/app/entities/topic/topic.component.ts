import { Component, OnInit, OnDestroy, TrackByFunction } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SortDirective, SortByDirective } from 'app/shared/sort';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { SortService } from 'app/shared/sort/sort.service';

import { AccountService } from 'app/core/auth/account.service';

import { ITopic } from 'app/shared/model/topic.model';
import { IAddress } from 'app/shared/model/address.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { TopicService } from './topic.service';
import { TopicDeleteDialogComponent } from './topic-delete-dialog.component';
import { IBroker } from 'app/shared/model/broker.model';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'jhi-topic',
  templateUrl: './topic.component.html',
})
export class TopicComponent implements OnInit, OnDestroy {

  topics: ITopic[];
  addresses: IAddress[];
  brokers: IBroker[];
  eventSubscriber?: Subscription;
  currentAccount: any;
  itemsPerPage: number;
  links: any;
  page: number;
  predicate: string;
  ascending: boolean;

  timeInterval: Subscription;
  isBroker: boolean;

  searchTopicText: string = '';
  brokerType = '';

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
    this.predicate = 'name';
    this.ascending = false;
  }

  ngOnInit(): void {

	this.setSearchBox();

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
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
    this.timeInterval.unsubscribe();
  }


  reset(): void {
    this.page = 0;
    this.setSearchBox();
    this.getBrokerType();
  }

  loadPage(page: number): void {
    this.page = page;
	this.setSearchBox();
    this.getBrokerType();
  }

   setSearchBox(){
    const searchText = localStorage.getItem('searchTopicText');
	if(searchText){
		this.searchTopicText = searchText;
	}else{
		this.searchTopicText = '';
	}
   }

  trackId(index: number, item: IAddress): number {
    return item.id!;
  }

  registerChangeInTopics(): void {
    this.eventSubscriber = this.eventManager.subscribe('topicListModification', () => this.reset());
  }

  poll(): void {
    this.timeInterval = interval(10000).subscribe(x => {
      this.updateAllTopics();
    });
  }

  registerDeletedTopics() {
    this.eventManager.subscribe('topicDeleted', res => {
      this.getBrokerType();
    });
  }

  delete(topic: ITopic): void {
    const modalRef = this.modalService.open(TopicDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.topic = topic;
  }

  sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'name') {
      result.push('name');
    }
    return result;
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
        },
        error => {
          console.log(error);
          this.isBroker = false;
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
        },
        error => {
          console.log(error);
          this.isBroker = false;
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
