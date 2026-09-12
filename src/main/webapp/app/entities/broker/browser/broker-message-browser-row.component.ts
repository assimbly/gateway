import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Message } from 'app/shared/model/message.model';

@Component({
  selector: '[jhi-broker-message-browser-row]',
  templateUrl: './broker-message-browser-row.component.html',
})
export class BrokerMessageBrowserRowComponent implements OnInit, OnDestroy {
  @Input() message: Message;

  messageRowID: string;

  public previousState: string;
  public p = false;

  modalRef: NgbModalRef | null;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
