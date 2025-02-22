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

    open(component: Component, id?: number | any, type?: string): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                this.ngbModalRef = null;
            }

            if (id) {
                this.routeService.find(id).subscribe(route => {
                    this.ngbModalRef = this.routeModalRef(component, route.body, type);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.routeModalRef(component, new Route(), type);
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    routeModalRef(component: any, route: Route, type?: string): NgbModalRef {
        const modalRef = this.modalService.open(component, { windowClass: 'fullscreen-modal'});
        if (typeof component as Component) {
            modalRef.componentInstance.route = route;
            modalRef.componentInstance.type = type;
        }
        return modalRef;
    }
}
