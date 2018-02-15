import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Service } from './service.model';
import { ServicePopupService } from './service-popup.service';
import { ServiceService } from './service.service';

@Component({
    selector: 'jhi-service-dialog',
    templateUrl: './service-dialog.component.html'
})
export class ServiceDialogComponent implements OnInit {

    service: Service;
    isSaving: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private serviceService: ServiceService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.service.id !== undefined) {
            this.subscribeToSaveResponse(
                this.serviceService.update(this.service));
        } else {
            this.subscribeToSaveResponse(
                this.serviceService.create(this.service));
        }
    }

    private subscribeToSaveResponse(result: Observable<Service>) {
        result.subscribe((res: Service) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Service) {
        this.eventManager.broadcast({ name: 'serviceListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }
}

@Component({
    selector: 'jhi-service-popup',
    template: ''
})
export class ServicePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private servicePopupService: ServicePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.servicePopupService
                    .open(ServiceDialogComponent as Component, params['id']);
            } else {
                this.servicePopupService
                    .open(ServiceDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
