import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { Maintenance } from './maintenance.model';
import { MaintenanceService } from './maintenance.service';

@Injectable()
export class MaintenancePopupService {
    private ngbModalRef: NgbModalRef;
    
    constructor(
        private datePipe: DatePipe,
        private modalService: NgbModal,
        private router: Router,
        private maintenanceService: MaintenanceService

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
                this.maintenanceService.find(id).subscribe((maintenance) => {
                    maintenance.startTime = new Date(this.datePipe.transform(maintenance.startTime, 'yyyy-MM-ddTHH:mm:ss'));
                    maintenance.endTime = new Date(this.datePipe.transform(maintenance.endTime, 'yyyy-MM-ddTHH:mm:ss'));
                    this.ngbModalRef = this.maintenanceModalRef(component, maintenance);
                    resolve(this.ngbModalRef);
                });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.maintenanceModalRef(component, new Maintenance());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    maintenanceModalRef(component: Component, maintenance: Maintenance): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.maintenance = maintenance;
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
