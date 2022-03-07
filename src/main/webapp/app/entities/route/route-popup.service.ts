import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RouteService } from './route.service';
import { Route } from 'app/shared/model/route.model';

@Injectable()
export class RoutePopupService {
    private ngbModalRef: NgbModalRef;

    constructor(private modalService: NgbModal, private router: Router, private routeService: RouteService) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.routeService.find(id).subscribe(route => {
                    this.ngbModalRef = this.routeModalRef(component, route.body);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.routeModalRef(component, new Route());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    routeModalRef(component: any, route: Route): NgbModalRef {
        const modalRef = this.modalService.open(component, { windowClass: 'fullscreen-modal'});
        if (typeof component as Component) {
            modalRef.componentInstance.route = route;
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
