import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GatewayService } from './gateway.service';
import { Gateway } from 'app/shared/model/gateway.model';

@Injectable({ providedIn: 'root' })
export class GatewayPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private gatewayService: GatewayService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.gatewayService.find(id).subscribe(gateway => {
                    this.ngbModalRef = this.gatewayModalRef(component, gateway.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.gatewayModalRef(component, new Gateway());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    gatewayModalRef(component: any, gateway: Gateway): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static' });
        if (typeof component as Component) {
            modalRef.componentInstance.gateway = gateway;
        }
        return modalRef;
    }
}
