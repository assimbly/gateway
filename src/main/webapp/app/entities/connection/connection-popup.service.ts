import { Injectable, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionService } from './connection.service';
import { IConnection, Connection } from 'app/shared/model/connection.model';

@Injectable({ providedIn: 'root' })
export class ConnectionPopupService {
    private modalService = inject(NgbModal);
    private router = inject(Router);
    private connectionService = inject(ConnectionService);

    private ngbModalRef: NgbModalRef;

    constructor() {
        this.ngbModalRef = null!;
    }

    open(component: Component, id?: number | any, type?: string): Promise<NgbModalRef> {

        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                this.ngbModalRef = null!;
            }

            if (id) {
                this.connectionService.find(id).subscribe(connection => {
                    this.ngbModalRef = this.connectionModalRef(component, connection.body!);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    let connection = new Connection();
                    if(type){
                      connection.type = type;
                    }
                    this.ngbModalRef = this.connectionModalRef(component, connection);
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    connectionModalRef(component: any, connection: Connection): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.connection = connection;
        return modalRef;
    }
}
