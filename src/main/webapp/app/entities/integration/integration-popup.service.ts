import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationService } from './integration.service';
import { Integration } from 'app/shared/model/integration.model';

@Injectable({ providedIn: 'root' })
export class IntegrationPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private integrationService: IntegrationService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.integrationService.find(id).subscribe(integration => {
                    this.ngbModalRef = this.integrationModalRef(component, integration.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.integrationModalRef(component, new Integration());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    integrationModalRef(component: any, integration: Integration): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static' });
        if (typeof component as Component) {
            modalRef.componentInstance.integration = integration;
        }
        return modalRef;
    }
}
