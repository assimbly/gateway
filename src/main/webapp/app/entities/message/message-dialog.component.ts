import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IMessage, Message } from 'app/shared/model/message.model';
import { IHeader, Header } from 'app/shared/model/header.model';
import { MessageService } from './message.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';

import { HeaderService } from '../header/header.service';
import { filter } from 'rxjs/operators';
import { MessagePopupService } from 'app/entities/message/message-popup.service';

@Component({
  standalone: false,
  selector: 'jhi-message-dialog',
  templateUrl: './message-dialog.component.html',
})
export class MessageDialogComponent implements OnInit {
  message: IMessage;
  messages: IMessage[];
  messageNames: Array<string> = [];
  headers: Array<Header> = [];
  headerArray: Array<string> = [];
  isSaving: boolean;
  public typeHeader: string[] = ['header', 'property'];
  public languageHeader: string[] = ['constant', 'groovy', 'jsonpath', 'csimple', 'simple', 'spel', 'xpath'];

  constructor(
    public activeModal: NgbActiveModal,
    private messageService: MessageService,
    private headerService: HeaderService,
    private alertService: AlertService,
    private eventManager: EventManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.messageService.query().subscribe(
      res => {
        this.messages = res.body;
        this.messageNames = this.messages.map(h => h.name);
      },
      res => this.onError(res.body)
    );
    this.loadHeader(this.route.fragment['value'] === 'clone');
  }


  private loadHeader(cloneHeader: boolean) {
    if (this.message.id) {
      this.headerService.query().subscribe(res => {
        this.headers = res.body.filter(hk => hk.messageId === this.message.id);
      });
    } else {
      const hk = new Header();
      hk.type = this.typeHeader[0];
      hk.language = this.languageHeader[0];
      this.headers.push(hk);
      this.message.id = cloneHeader ? null : this.message.id;
    }
  }

  clear() {
    this.activeModal.dismiss('cancel');
  }

  save(closePopup: boolean) {
    this.isSaving = true;
    if (this.message.id !== undefined) {
      this.subscribeToSaveResponse(this.messageService.update(this.message), closePopup);
    } else {
      this.subscribeToSaveResponse(this.messageService.create(this.message), closePopup);
    }
  }

  deleteHeader(header) {
    this.headerService.delete(header.id).subscribe(res => {
      this.removeHeader(this.headers.indexOf(header));
    });
  }

  addHeader() {
    const newHeader = new Header();
    newHeader.isDisabled = false;
    newHeader.type = this.typeHeader[0];
    newHeader.language = this.languageHeader[0];
    this.headers.push(newHeader);
    this.mapHeaders();
  }

  removeHeader(i: number) {
    this.headers.splice(i, 1);
    this.mapHeaders();
    if (this.headers.length === 0) {
      this.addHeader();
    }
  }

  navigateToMessage() {
    this.router.navigate(['/message']);
    setTimeout(() => {
      this.activeModal.close();
    }, 0);
  }

  navigateToMessageDetail(messageId: number) {
    this.router.navigate(['/message', messageId]);
    setTimeout(() => {
      this.activeModal.close();
    }, 0);
  }

  private mapHeaders() {
    if (typeof this.headers !== 'undefined') {
      this.headerArray = this.headers.map(hk => hk.key);
      this.headerArray = this.headerArray.filter(k => k !== undefined);
    }
  }

  private subscribeToSaveResponse(result: Observable<HttpResponse<IMessage>>, closePopup) {
    result.subscribe(data => {
      if (data.ok) {
        this.onSaveSuccess(data.body, closePopup);
      } else {
        this.onSaveError();
      }
    });
  }

  private onSaveSuccess(result: IMessage, closePopup: boolean) {
	this.eventManager.broadcast(new EventWithContent('messageListModification', 'OK'));
	this.eventManager.broadcast(new EventWithContent('messageListModification', result.id ));
	this.eventManager.broadcast(new EventWithContent('messageListModification', result));
    this.isSaving = false;
    this.activeModal.dismiss(result);

    this.headers.forEach(header => {
      header.messageId = result.id;
      if (header.id) {
        this.headerService.update(header).subscribe(hk => {
          header = hk.body;
        });
      } else {
        this.headerService.create(header).subscribe(hk => {
          header = hk.body;
        });
      }
    });
  }

  private onSaveError() {
    this.isSaving = false;
  }
  private onError(error: any) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: error.message,
		});
  }
}

@Component({
  standalone: false,
  selector: 'jhi-message-popup',
  template: '',
})
export class MessagePopupComponent implements OnInit, OnDestroy {
  routeSub: any;

  constructor(private route: ActivatedRoute, private messagePopupService: MessagePopupService) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      console.log('message popup');
      if (params['id']) {
        this.messagePopupService.open(MessageDialogComponent as Component, params['id']);
      } else {
        this.messagePopupService.open(MessageDialogComponent as Component);
      }
    });
  }

  ngOnDestroy() {
    //this.routeSub.unsubscribe();
  }
}
