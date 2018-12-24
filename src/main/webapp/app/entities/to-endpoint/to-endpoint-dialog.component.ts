import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IToEndpoint, ToEndpoint } from 'app/shared/model/to-endpoint.model';
import { IFlow, Flow } from 'app/shared/model/flow.model';
import { IService, Service } from 'app/shared/model/service.model';
import { IHeader, Header } from 'app/shared/model/header.model';
import { ToEndpointService } from './to-endpoint.service';
import { FlowService } from '../flow';
import { ServiceService } from '../service';
import { HeaderService } from '../header';
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
        public components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.flowService.query()
            .subscribe(res => { this.flows = res.body; }, res => this.onError(res));
        this.serviceService
            .query({filter: 'toendpoint-is-null'})
            .subscribe(res => {
                if (!this.toEndpoint.serviceId) {
                    this.services = res.body;
                } else {
                    this.serviceService
                        .find(this.toEndpoint.serviceId)
                        .subscribe(subRes => {
                            this.services.push(subRes.body);
                        }, subRes => this.onError(subRes.body));
                }
            }, res => this.onError(res.json));
        this.headerService
            .query({filter: 'toendpoint-is-null'})
            .subscribe((res) => {
                if (!this.toEndpoint.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService
                        .find(this.toEndpoint.headerId)
                        .subscribe((subRes) => {
                            this.headers.push(subRes.body);
                        }, subRes => this.onError(subRes.body));
                }
            }, (res) => this.onError(res.body));
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
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
