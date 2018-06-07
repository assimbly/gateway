import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Service } from './service.model';
import { ServicePopupService } from './service-popup.service';
import { ServiceService } from './service.service';
import { ServiceKeys } from '../service-keys';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-service-dialog',
    templateUrl: './service-dialog.component.html'
})
export class ServiceDialogComponent implements OnInit {
    serviceKeys: ServiceKeys;
    service: Service;
    services: Service[];
    isSaving: boolean;
    typeServices: string[] = ['JDBC Connection', 'SonicMQ Connection', 'ActiveMQ Connection', 'Kafka Connection'];
    showEditButton = false;

    constructor(
        public activeModal: NgbActiveModal,
        private serviceService: ServiceService,
        private eventManager: JhiEventManager,
        private jhiAlertService: JhiAlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.serviceKeys = new ServiceKeys();
        this.isSaving = false;
        this.serviceService.query()
        .subscribe((res: ResponseWrapper) => {
        this.services = res.json;
        }, (res: ResponseWrapper) => this.onError(res.json));
        if (this.route.fragment['value'] === 'showEditServiceButton') {
            this.showEditButton = true;
        }
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.service.id !== undefined) {
            this.subscribeToSaveResponse(
                this.serviceService.update(this.service), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.serviceService.create(this.service), closePopup);
        }
    }

    navigateToService() {
        this.router.navigate(['/service']);
        setTimeout(() => {
            this.activeModal.close();
        }, 0);
    }

    private subscribeToSaveResponse(result: Observable<Service>, closePopup: boolean) {
        result.subscribe((res: Service) =>
            this.onSaveSuccess(res, closePopup), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Service, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'serviceListModification', content: 'OK'});
        this.eventManager.broadcast({ name: 'serviceKeysUpdated', content: result });
        this.eventManager.broadcast({name: 'serviceModified', content: result.id});
        this.isSaving = false;
        if (closePopup) {
            this.activeModal.dismiss(result);
        }
    }
    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
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
