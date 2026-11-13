import { Injectable, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from './message.service';
import { Message } from 'app/shared/model/message.model';

@Injectable({ providedIn: 'root' })
export class MessagePopupService {
    private modalService = inject(NgbModal);
    private router = inject(Router);
    private messageService = inject(MessageService);

    private ngbModalRef: NgbModalRef;

    constructor() {
        this.ngbModalRef = null!;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                this.ngbModalRef = null!;
            }

            if (id) {
                this.messageService.find(id).subscribe(message => {
                    this.ngbModalRef = this.messageModalRef(component, message.body!);
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
        modalRef.componentInstance.message = message;
        return modalRef;
    }
}
