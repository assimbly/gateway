import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Service } from './service.model';
import { ServicePopupService } from './service-popup.service';
import { ServiceService } from './service.service';

@Component({
    selector: 'jhi-service-delete-dialog',
    templateUrl: './service-delete-dialog.component.html'
})
export class ServiceDeleteDialogComponent {

    service: Service;

    constructor(
        private serviceService: ServiceService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.serviceService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'serviceListModification',
                content: 'Deleted an service'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-service-delete-popup',
    template: ''
})
export class ServiceDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private servicePopupService: ServicePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.servicePopupService
                .open(ServiceDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
