import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { FromEndpoint } from './from-endpoint.model';
import { FromEndpointPopupService } from './from-endpoint-popup.service';
import { FromEndpointService } from './from-endpoint.service';
import { Service, ServiceService } from '../service';
import { Header, HeaderService } from '../header';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-from-endpoint-dialog',
    templateUrl: './from-endpoint-dialog.component.html'
})
export class FromEndpointDialogComponent implements OnInit {

    fromEndpoint: FromEndpoint;
    isSaving: boolean;

    services: Service[];

    headers: Header[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private fromEndpointService: FromEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.serviceService
            .query({filter: 'fromendpoint-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.fromEndpoint.serviceId) {
                    this.services = res.json;
                } else {
                    this.serviceService
                        .find(this.fromEndpoint.serviceId)
                        .subscribe((subRes: Service) => {
                            this.services = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.headerService
            .query({filter: 'fromendpoint-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.fromEndpoint.headerId) {
                    this.headers = res.json;
                } else {
                    this.headerService
                        .find(this.fromEndpoint.headerId)
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
        if (this.fromEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(
                this.fromEndpointService.update(this.fromEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.fromEndpointService.create(this.fromEndpoint));
        }
    }

    private subscribeToSaveResponse(result: Observable<FromEndpoint>) {
        result.subscribe((res: FromEndpoint) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: FromEndpoint) {
        this.eventManager.broadcast({ name: 'fromEndpointListModification', content: 'OK'});
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
    selector: 'jhi-from-endpoint-popup',
    template: ''
})
export class FromEndpointPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private fromEndpointPopupService: FromEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.fromEndpointPopupService
                    .open(FromEndpointDialogComponent as Component, params['id']);
            } else {
                this.fromEndpointPopupService
                    .open(FromEndpointDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
