import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { IMessage, Message } from 'app/shared/model/message.model';
import { IHeader, Header } from 'app/shared/model/header.model';
import { MessageService } from './message.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { HeaderService } from '../header/header.service';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'jhi-message-update',
  templateUrl: './message-update.component.html',
})
export class MessageUpdateComponent implements OnInit {
  message: IMessage;
  messages: IMessage[];
  messageNames: Array<string> = [];
  headers: Array<Header> = [];
  headerArray: Array<string> = [];
  isSaving: boolean;
  public typeHeader: string[] = ['header', 'property'];
  public languageHeader: string[] = ['constant', 'groovy', 'jsonpath', 'csimple', 'simple', 'spel', 'xpath'];

  constructor(
    protected messageService: MessageService,
    protected headerService: HeaderService,
    protected eventManager: EventManager,
    protected activatedRoute: ActivatedRoute,
    protected router: Router
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ message }) => {
      this.message = message;
      if (this.activatedRoute.fragment['value'] === 'clone') {
        this.loadHeader(true);
      } else {
        this.loadHeader(false);
      }
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    if (this.message.id) {
      this.subscribeToSaveResponse(this.messageService.update(this.message));
    } else {
      this.subscribeToSaveResponse(this.messageService.create(this.message));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMessage>>) {
    result.subscribe(
      (res: HttpResponse<IMessage>) => this.onSaveSuccess(res.body),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected onSaveSuccess(result: IMessage) {
    this.eventManager.broadcast(new EventWithContent('messageListModification', 'OK'));
    this.eventManager.broadcast(new EventWithContent('messageModified', result.id));
    this.eventManager.broadcast(new EventWithContent('headerUpdated', result));
    this.isSaving = false;

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

    this.navigateToMessage();
  }

  protected onSaveError() {
    this.isSaving = false;
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
    this.mapHeader();
  }

  removeHeader(i: number) {
    this.headers.splice(i, 1);
    this.mapHeader();
    if (this.headers.length === 0) {
      this.addHeader();
    }
  }

  clearHeaderIds() {
    this.headers.forEach((element, index) => {
      this.headers[index].messageId = null;
      this.headers[index].id = null;
    });
  }

  navigateToMessage() {
    this.router.navigate(['/message']);
  }

  navigateToMessageDetail(messageId: number) {
    this.router.navigate(['/message', messageId]);
  }

  private mapHeader() {
    if (typeof this.headers !== 'undefined') {
      this.headerArray = this.headers.map(hk => hk.key);
      this.headerArray = this.headerArray.filter(k => k !== undefined);
    }
  }

  private loadHeader(cloneMessage: boolean) {
    const criteria = {
      'messageId.equals': this.message.id,
    };

    if (this.message.id) {
      this.headerService.query({ filter: 'messageId.equals=1' }).subscribe(res => {
        this.headers = res.body.filter(header => header.messageId === this.message.id);
        if (cloneMessage) {
          this.message.id = null;
          this.message.name = null;
          this.clearHeaderIds();
        }
      });
    } else {
      const hk = new Header();
      hk.type = this.typeHeader[0];
      hk.language = this.languageHeader[0];
      this.headers.push(hk);
      this.message.id = cloneMessage ? null : this.message.id;
    }
  }
}
