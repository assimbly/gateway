import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ServiceService } from './service.service';
import { IService, Service } from 'app/shared/model/service.model';

@Injectable()
export class ServicePopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private serviceService: ServiceService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any, type?: string): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.serviceService.find(id).subscribe(service => {
                    this.ngbModalRef = this.serviceModalRef(component, service.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    let service = new Service();
                    if(type){
                      service.type = type;
                    }
                    this.ngbModalRef = this.serviceModalRef(component, service);
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    serviceModalRef(component: any, service: Service): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static' });
        if (typeof component as Component) {
            modalRef.componentInstance.service = service;
        }
        return modalRef;
    }
}
