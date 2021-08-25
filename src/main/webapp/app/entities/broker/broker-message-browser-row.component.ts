import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { LoginModalService } from 'app/core';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Message } from 'app/shared/model/messsage.model';

@Component({
    selector: '[jhi-broker-message-browser-row]',
    templateUrl: './broker-message-browser-row.component.html'
})
export class BrokerMessageBrowserRowComponent implements OnInit, OnDestroy {
    @Input() message: Message;
    @Input() isAdmin: boolean;

    messageRowID: string;

    public previousState: string;
    public p = false;

    modalRef: NgbModalRef | null;

    constructor(private loginModalService: LoginModalService, private modalService: NgbModal) {}

    ngOnInit() {}

    ngOnDestroy() {}
}
