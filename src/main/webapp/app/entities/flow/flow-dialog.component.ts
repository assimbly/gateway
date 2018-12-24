import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Flow, IFlow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { IFromEndpoint, FromEndpoint } from 'app/shared/model/from-endpoint.model';
import { IErrorEndpoint, ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { IService, Service } from 'app/shared/model/service.model';
import { IHeader, Header } from 'app/shared/model/header.model';


import { GatewayService } from '../gateway';
import { FromEndpointService } from '../from-endpoint';
import { ErrorEndpointService } from '../error-endpoint';
import { IGateway } from "app/shared/model/gateway.model";

@Component({
    selector: 'jhi-flow-dialog',
    templateUrl: './flow-dialog.component.html'
})
export class FlowDialogComponent implements OnInit {

    flow: Flow;
    isSaving: boolean;

    gateways: IGateway[];

    fromendpoints: IFromEndpoint[];

    errorendpoints: IErrorEndpoint[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private flowService: FlowService,
        private gatewayService: GatewayService,
        private fromEndpointService: FromEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.gatewayService.query()
            .subscribe(res => { this.gateways = res.body; }, res => this.onError(res.body));
        this.fromEndpointService
            .query({filter: 'flow-is-null'})
            .subscribe(res => {
                if (!this.flow.fromEndpointId) {
                    this.fromendpoints = res.body;
                } else {
                    this.fromEndpointService
                        .find(this.flow.fromEndpointId)
                        .subscribe(subRes => {
                            this.fromendpoints.push(subRes.body);
                        }, (subRes) => this.onError(subRes));                       
                }
            });
        
        this.errorEndpointService
            .query({filter: 'flow-is-null'})
            .subscribe(res => {
                if (!this.flow.errorEndpointId) {
                    this.errorendpoints = res.body;
                } else {
                    this.errorEndpointService
                        .find(this.flow.errorEndpointId)
                        .subscribe(subRes => {
                            this.errorendpoints.push(subRes.body);
                        }, subRes => this.onError(subRes.body));
                }
            }, res => this.onError(res.body));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.flow.id !== undefined) {
            this.subscribeToSaveResponse(
                this.flowService.update(this.flow));
        } else {
            this.subscribeToSaveResponse(
                this.flowService.create(this.flow));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IFlow>>) {
        result.subscribe(data => {
            if(data.ok){
                this.onSaveSuccess(data.body);
            }else{
                this.onSaveError()
            }
            }    
        )
    }

    private onSaveSuccess(result: Flow) {
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackGatewayById(index: number, item: IGateway) {
        return item.id;
    }

    trackFromEndpointById(index: number, item: FromEndpoint) {
        return item.id;
    }

    trackErrorEndpointById(index: number, item: ErrorEndpoint) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-flow-popup',
    template: ''
})
export class FlowPopupComponent implements OnInit, OnDestroy {

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
