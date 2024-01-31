import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionService } from './connection.service';
import { IConnection, Connection } from 'app/shared/model/connection.model';

@Injectable()
export class ConnectionPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private connectionService: ConnectionService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any, type?: string): Promise<NgbModalRef> {

        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                this.ngbModalRef = null;
            }

            if (id) {
                this.connectionService.find(id).subscribe(connection => {
                    this.ngbModalRef = this.connectionModalRef(component, connection.body);
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
        if (typeof component as Component) {
            modalRef.componentInstance.connection = connection;
        }
        return modalRef;
    }
}
