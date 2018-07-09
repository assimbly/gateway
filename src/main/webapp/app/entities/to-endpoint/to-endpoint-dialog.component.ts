import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ToEndpoint } from './to-endpoint.model';
import { ToEndpointPopupService } from './to-endpoint-popup.service';
import { ToEndpointService } from './to-endpoint.service';
import { Flow, FlowService } from '../flow';
import { Service, ServiceService } from '../service';
import { Header, HeaderService } from '../header';
import { ResponseWrapper } from '../../shared';
import { EndpointType, Components } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-to-endpoint-dialog',
    templateUrl: './to-endpoint-dialog.component.html'
})
export class ToEndpointDialogComponent implements OnInit {

    toEndpoint: ToEndpoint;
    isSaving: boolean;

    flows: Flow[];

    services: Service[];

    headers: Header[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private toEndpointService: ToEndpointService,
        private flowService: FlowService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private eventManager: JhiEventManager,
        private components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.flowService.query()
            .subscribe((res: ResponseWrapper) => { this.flows = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
        this.serviceService
            .query({filter: 'toendpoint-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.toEndpoint.serviceId) {
                    this.services = res.json;
                } else {
                    this.serviceService
                        .find(this.toEndpoint.serviceId)
                        .subscribe((subRes: Service) => {
                            this.services = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.headerService
            .query({filter: 'toendpoint-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.toEndpoint.headerId) {
                    this.headers = res.json;
                } else {
                    this.headerService
                        .find(this.toEndpoint.headerId)
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
        if (this.toEndpoint.id !== undefined) {
            this.subscribeToSaveResponse(
                this.toEndpointService.update(this.toEndpoint));
        } else {
            this.subscribeToSaveResponse(
                this.toEndpointService.create(this.toEndpoint));
        }
    }

    private subscribeToSaveResponse(result: Observable<ToEndpoint>) {
        result.subscribe((res: ToEndpoint) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: ToEndpoint) {
        this.eventManager.broadcast({ name: 'toEndpointListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackFlowById(index: number, item: Flow) {
        return item.id;
    }

    trackServiceById(index: number, item: Service) {
        return item.id;
    }

    trackHeaderById(index: number, item: Header) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-to-endpoint-popup',
    template: ''
})
export class ToEndpointPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private toEndpointPopupService: ToEndpointPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.toEndpointPopupService
                    .open(ToEndpointDialogComponent as Component, params['id']);
            } else {
                this.toEndpointPopupService
                    .open(ToEndpointDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
