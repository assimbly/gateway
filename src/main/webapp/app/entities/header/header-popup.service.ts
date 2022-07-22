import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from './header.service';
import { Header } from 'app/shared/model/header.model';

@Injectable()
export class HeaderPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private headerService: HeaderService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                this.ngbModalRef = null;
            }

            if (id) {
                this.headerService.find(id).subscribe(header => {
                    this.ngbModalRef = this.headerModalRef(component, header.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.headerModalRef(component, new Header());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    headerModalRef(component: any, header: Header): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static' });
        if (typeof component as Component) {
            modalRef.componentInstance.header = header;
        }
        return modalRef;
    }
}
