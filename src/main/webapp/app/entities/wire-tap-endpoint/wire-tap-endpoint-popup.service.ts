import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WireTapEndpoint } from './wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';

@Injectable()
export class WireTapEndpointPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(
        private modalService: NgbModal,
        private router: Router,
        private wireTapEndpointService: WireTapEndpointService

    ) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.wireTapEndpointService.find(id).subscribe((wireTapEndpoint) => {
                    this.ngbModalRef = this.wireTapEndpointModalRef(component, wireTapEndpoint);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.wireTapEndpointModalRef(component, new WireTapEndpoint());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    wireTapEndpointModalRef(component: Component, wireTapEndpoint: WireTapEndpoint): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.wireTapEndpoint = wireTapEndpoint;
        modalRef.result.then((result) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true, queryParamsHandling: 'merge' });
            this.ngbModalRef = null;
        }, (reason) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true, queryParamsHandling: 'merge' });
            this.ngbModalRef = null;
        });
        return modalRef;
    }
}
