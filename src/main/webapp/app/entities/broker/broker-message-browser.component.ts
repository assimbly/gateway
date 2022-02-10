import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IMessage } from 'app/shared/model/messsage.model';
import { AccountService } from 'app/core/auth/account.service';
import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { BrokerService } from 'app/entities/broker/broker.service';

import { saveAs } from 'file-saver/FileSaver';
import { IBroker } from 'app/shared/model/broker.model';

import 'brace';
import 'brace/mode/text';
import 'brace/mode/json';
import 'brace/theme/eclipse';
import { IHeaderKeys } from 'app/shared/model/header-keys.model';

@Component({
  selector: 'jhi-broker-message-browser',
  templateUrl: './broker-message-browser.component.html',
})
export class BrokerMessageBrowserComponent implements OnInit, OnDestroy {
  messages: IMessage[];
  message: IMessage;
  selectedMessage: IMessage = {};
  selectedHighlight: string;
  allMessages: any;
  headers: any;
  headerKeys: IHeaderKeys[];

  brokers: IBroker[];
  brokerType: string;
  endpointName: string;
  endpointType: string;
  targetEndpointName: string;

  currentAccount: any;
  eventSubscriber: Subscription;
  itemsPerPage: number;
  links: any;

  predicate: any;
  reverse: any;
  totalItems = -1;

  page: any;
  numberOfMessages = 100;
  messagesCount: number;
  fileExtension: string;
  isLoading = false;
  finished = false;
  test: any;
  searchText = '';
  active = '0';
  descending = false;
  ascending = true;
  subtitle: string;

  objectKeys = Object.keys;

  modalRef: NgbModalRef | null;

  constructor(
    private brokerService: BrokerService,
    protected jhiAlertService: JhiAlertService,
    protected eventManager: JhiEventManager,
    protected parseLinks: JhiParseLinks,
    private modalService: NgbModal,
    protected accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.messages = [];
    this.itemsPerPage = ITEMS_PER_PAGE + 5;
    this.page = 1;
    this.links = {
      last: 0,
    };
    this.predicate = 'name';
    this.reverse = true;
  }

  ngOnInit() {
    this.accountService.identity().subscribe(account => {
      this.currentAccount = account;
    });

    this.route.params.subscribe(params => {
      this.endpointType = params['endpointType'];
      this.endpointName = params['endpointName'];
      this.brokerType = params['brokerType'];
    });

    this.loadMessages();
    this.finished = true;
    this.registerChangeInFlows();
  }

  ngAfterViewInit() {
    this.finished = true;
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  loadMessages() {
    this.isLoading = true;
    if (this.brokerType) {
      this.getMessages();
    } else {
      this.brokerService.getBrokers().subscribe(
        data => {
          if (data) {
            for (let i = 0; i < data.body.length; i++) {
              this.brokers.push(data.body[i]);
            }
            this.brokerType = this.brokers[0].type;
            if (this.brokerType != null) {
              this.getMessages();
            } else {
              console.log('Unknown broker: set brokertype to artemis');
              this.brokerType = 'artemis';
              this.getMessages();
            }
          }
        },
        error => console.log(error)
      );
    }
  }

  getMessages() {
    this.brokerService.countMessages(this.brokerType, this.endpointName).subscribe(
      (res: HttpResponse<string>) => this.onSuccessCount(res.body, res.headers),
      (res: HttpErrorResponse) => this.onError(res.message)
    );

    this.brokerService.browseMessages(this.brokerType, this.endpointName, this.page, this.numberOfMessages, true).subscribe(
      (res: HttpResponse<IMessage[]>) => this.onSuccess(res.body, res.headers),
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  private onSuccess(data, headers) {
    this.isLoading = false;
    this.messages = new Array<IMessage>();
    this.allMessages = data;

    if (data.messages.message) {
      let itemNumber = 0;

      if (this.page > 1) {
        itemNumber = (this.page - 1) * this.numberOfMessages;
      }

      for (let i = data.messages.message.length - 1; i > -1; i--) {
        this.message = {};

        itemNumber = itemNumber + 1;
        this.message.number = itemNumber;
        this.message.messageid = data.messages.message[i].messageid;
        if (this.brokerType === 'artemis') {
          this.message.timestamp = this.timeConverter(data.messages.message[i].timestamp);
        } else {
          this.message.timestamp = data.messages.message[i].timestamp;
        }

        this.messages.push(this.message);

        if (i === data.messages.message.length - 1) {
          this.showMessage(this.message);
        }
      }

      this.totalItems = this.numberOfMessages;
    }
  }

  private onSuccessCount(data, headers) {
    this.messagesCount = parseInt(data);

    if (this.messagesCount === 0) {
      this.subtitle = '0 messages on ' + this.endpointType + ' ' + this.endpointName;
    } else if (this.messagesCount === 1) {
      this.subtitle = '1 message on ' + this.endpointType + ' ' + this.endpointName;
    } else {
      this.subtitle = this.messagesCount.toString() + ' messages on ' + this.endpointType + ' ' + this.endpointName;
    }
  }

  private onSuccessBrowse(data, headers) {
    if (data.messages.message) {
      for (let i = 0; i < data.messages.message.length; i++) {
        const message = data.messages.message[i];

        this.selectedMessage = {};
        this.selectedMessage.messageid = message.messageid;
        this.selectedMessage.timestamp = message.timestamp;
        this.selectedMessage.headers = message.headers;
        this.selectedMessage.headerKeys = [];
        this.selectedMessage.jmsHeaders = message.jmsHeaders;
        this.selectedMessage.body = this.getBody(message);
        this.selectedMessage.fileType = this.getFileType(this.selectedMessage.body);
      }
    }
  }

  getBody(message: any) {
    let body = '';

    if (message.body) {
      body = message.body;
    } else if (message.BodyPreview) {
      // Convert to byte array
      const data = new Uint8Array(message.BodyPreview);
      // Decode with TextDecoder
      body = new TextDecoder('shift-jis').decode(data.buffer);
    }

    return body;
  }

  /*
    getJMSHeaders(message: any){

        const jmsHeaders = Object.keys(message).filter(key => key.startsWith('JMS'))
            .reduce((obj, key) => {
                obj[key] = message[key];
                return obj;
            }, {});

        return jmsHeaders;

    }*/

  private onError(errorMessage: string) {
    this.isLoading = false;
    this.jhiAlertService.error(errorMessage, null, null);
  }

  reset() {
    this.page = 0;
    this.messages = [];
    this.loadMessages();
  }

  trackTimestamp(index: number, item: IMessage) {
    return item.timestamp;
  }

  registerChangeInFlows() {
    this.eventSubscriber = this.eventManager.subscribe('messageListModification', response => this.reset());
  }

  sortByTimestamp() {
    if (this.descending) {
      this.messages.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      this.descending = false;
    } else {
      this.messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      this.descending = true;
    }

    this.messages = [...this.messages];
  }

  trigerAction(selectedAction: string) {
    this.eventManager.broadcast({ name: 'trigerAction', content: selectedAction });
  }

  refreshMessages() {
    this.loadMessages();
  }

  deleteMessage(message: IMessage) {
    this.brokerService.deleteMessage(this.brokerType, this.endpointName, message.messageid).subscribe(
      (res: HttpResponse<any>) => {
        this.loadMessages();
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  moveMessage(message: IMessage) {
    this.brokerService.moveMessage(this.brokerType, this.endpointName, this.targetEndpointName, message.messageid).subscribe(
      (res: HttpResponse<any>) => {
        this.loadMessages();
        this.cancelModal();
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  saveMessage(message: IMessage, bodyOnly: boolean) {
    if (message.fileType) {
      this.fileExtension = message.fileType;
    } else {
      this.fileExtension = 'txt';
    }

    const today = new Date().toISOString().slice(0, 10);

    if (bodyOnly) {
      const blob = new Blob([message.body], { type: 'application/' + this.fileExtension });
      saveAs(blob, `${today}-${this.endpointName}-${message.messageid}.${this.fileExtension}`);
    } else {
      this.brokerService.browseMessage(this.brokerType, this.endpointName, message.messageid).subscribe(
        (res: HttpResponse<any>) => {
          const exportMessage = JSON.stringify(res.body);
          const blob = new Blob([exportMessage], { type: 'application/json' });
          saveAs(blob, `${today}-${this.endpointName}-${message.messageid}.json`);
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
    }
  }

  saveAllMessages() {
    this.brokerService.browseMessages(this.brokerType, this.endpointName, this.page, this.numberOfMessages, false).subscribe(
      (res: HttpResponse<IMessage[]>) => {
        this.allMessages = res.body;
        const exportMessage = JSON.stringify(this.allMessages);
        const blob = new Blob([exportMessage], { type: 'application/json' });
        const today = new Date().toISOString().slice(0, 10);
        saveAs(blob, `${today}-${this.endpointName}.json`);
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  showMessage(message: IMessage) {
    this.selectedHighlight = message.messageid;
    this.brokerService.browseMessage(this.brokerType, this.endpointName, message.messageid).subscribe(
      (res: HttpResponse<IMessage[]>) => this.onSuccessBrowse(res.body, res.headers),
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  previousPage() {
    this.page = this.page - 1;
    this.messages = new Array<IMessage>();
    this.loadMessages();
  }

  nextPage() {
    this.page = this.page + 1;
    this.messages = new Array<IMessage>();
    this.loadMessages();
  }

  openModal(templateRef: TemplateRef<any>) {
    this.modalRef = this.modalService.open(templateRef);
  }

  cancelModal(): void {
    if (this.modalRef) {
      this.modalRef.dismiss();
      this.modalRef = null;
    }
  }

  getFileType(doc) {
    try {
      // try to parse via json
      const a = JSON.parse(doc);
      return 'json';
    } catch (e) {
      try {
        // try xml parsing
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(doc, 'application/xml');
        if (xmlDoc.documentElement.nodeName == '' || xmlDoc.documentElement.nodeName == 'parsererror') return 'txt';
        else return 'xml';
      } catch (e) {
        return 'txt';
      }
    }
  }

  timeConverter(UNIX_timestamp) {
    const a = new Date(UNIX_timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
  }
}
