import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FlowService } from './flow.service';
import { Flow } from 'app/shared/model/flow.model';

@Injectable()
export class FlowPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private flowService: FlowService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.flowService.find(id).subscribe(flow => {
                    this.ngbModalRef = this.flowModalRef(component, flow.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.flowModalRef(component, new Flow());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    flowModalRef(component: any, flow: Flow): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static' });
        if (typeof component as Component) {
            modalRef.componentInstance.flow = flow;
            modalRef.result.then(
                result => {
                    this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                    this.ngbModalRef = null;
                },
                reason => {
                    this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                    this.ngbModalRef = null;
                }
            );
        }
        return modalRef;
    }
}
