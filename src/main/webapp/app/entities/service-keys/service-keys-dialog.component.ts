import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ServiceKeys } from './service-keys.model';
import { ServiceKeysPopupService } from './service-keys-popup.service';
import { ServiceKeysService } from './service-keys.service';
import { Service, ServiceService } from '../service';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-service-keys-dialog',
    templateUrl: './service-keys-dialog.component.html'
})
export class ServiceKeysDialogComponent implements OnInit {

    serviceKeys: ServiceKeys;
    isSaving: boolean;

    services: Service[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private serviceKeysService: ServiceKeysService,
        private serviceService: ServiceService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService.query()
            .subscribe((res: ResponseWrapper) => { this.services = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.serviceKeys.id !== undefined) {
            this.subscribeToSaveResponse(
                this.serviceKeysService.update(this.serviceKeys));
        } else {
            this.subscribeToSaveResponse(
                this.serviceKeysService.create(this.serviceKeys));
        }
    }

    private subscribeToSaveResponse(result: Observable<ServiceKeys>) {
        result.subscribe((res: ServiceKeys) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: ServiceKeys) {
        this.eventManager.broadcast({ name: 'serviceKeysListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackServiceById(index: number, item: Service) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-service-keys-popup',
    template: ''
})
export class ServiceKeysPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private serviceKeysPopupService: ServiceKeysPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.serviceKeysPopupService
                    .open(ServiceKeysDialogComponent as Component, params['id']);
            } else {
                this.serviceKeysPopupService
                    .open(ServiceKeysDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
