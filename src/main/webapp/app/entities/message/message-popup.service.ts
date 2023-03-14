import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from './message.service';
import { Message } from 'app/shared/model/message.model';

@Injectable()
export class MessagePopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private messageService: MessageService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                this.ngbModalRef = null;
            }

            if (id) {
                this.messageService.find(id).subscribe(message => {
                    this.ngbModalRef = this.messageModalRef(component, message.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.messageModalRef(component, new Message());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    messageModalRef(component: any, message: Message): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'xl', backdrop: 'static' });
        if (typeof component as Component) {
            modalRef.componentInstance.message = message;
        }
        return modalRef;
    }
}
