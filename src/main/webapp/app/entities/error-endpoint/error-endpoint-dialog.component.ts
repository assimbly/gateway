import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ErrorEndpoint } from './error-endpoint.model';
import { ErrorEndpointPopupService } from './error-endpoint-popup.service';
import { ErrorEndpointService } from './error-endpoint.service';
import { Service, ServiceService } from '../service';
import { Header, HeaderService } from '../header';
import { ResponseWrapper } from '../../shared';
import { EndpointType, Components } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-error-endpoint-dialog',
    templateUrl: './error-endpoint-dialog.component.html'
})
export class ErrorEndpointDialogComponent implements OnInit {

    errorEndpoint: ErrorEndpoint;
    isSaving: boolean;

    services: Service[];

    headers: Header[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private errorEndpointService: ErrorEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager,
        public components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService
            .query({filter: 'errorendpoint-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.errorEndpoint.serviceId) {
                    this.services = res.json;
                } else {
                    this.serviceService
                        .find(this.errorEndpoint.serviceId)
                        .subscribe((subRes: Service) => {
                            this.services = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.headerService
            .query({filter: 'errorendpoint-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.errorEndpoint.headerId) {
                    this.headers = res.json;
                } else {
                    this.headerService
                        .find(this.errorEndpoint.headerId)
                        .subscribe((subRes: Header) => {
                            this.headers = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.errorEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(
                this.errorEndpointService.update(this.errorEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.errorEndpointService.create(this.errorEndpoint));
        }
    }

    private subscribeToSaveResponse(result: Observable<ErrorEndpoint>) {
        result.subscribe((res: ErrorEndpoint) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: ErrorEndpoint) {
        this.eventManager.broadcast({ name: 'errorEndpointListModification', content: 'OK'});
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

    trackHeaderById(index: number, item: Header) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-error-endpoint-popup',
    template: ''
})
export class ErrorEndpointPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private errorEndpointPopupService: ErrorEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.errorEndpointPopupService
                    .open(ErrorEndpointDialogComponent as Component, params['id']);
            } else {
                this.errorEndpointPopupService
                    .open(ErrorEndpointDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
