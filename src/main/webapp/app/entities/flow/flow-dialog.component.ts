import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Flow } from './flow.model';
import { FlowPopupService } from './flow-popup.service';
import { FlowService } from './flow.service';
import { Gateway, GatewayService } from '../gateway';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-flow-dialog',
    templateUrl: './flow-dialog.component.html'
})
export class FlowDialogComponent implements OnInit {

    flow: Flow;
    isSaving: boolean;

    gateways: Gateway[];

    fromendpoints: FromEndpoint[];

    errorendpoints: ErrorEndpoint[];

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
            .subscribe((res: ResponseWrapper) => { this.gateways = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
        this.fromEndpointService
            .query({filter: 'flow-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.flow.fromEndpointId) {
                    this.fromendpoints = res.json;
                } else {
                    this.fromEndpointService
                        .find(this.flow.fromEndpointId)
                        .subscribe((subRes: FromEndpoint) => {
                            this.fromendpoints = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.errorEndpointService
            .query({filter: 'flow-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.flow.errorEndpointId) {
                    this.errorendpoints = res.json;
                } else {
                    this.errorEndpointService
                        .find(this.flow.errorEndpointId)
                        .subscribe((subRes: ErrorEndpoint) => {
                            this.errorendpoints = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
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

    private subscribeToSaveResponse(result: Observable<Flow>) {
        result.subscribe((res: Flow) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
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

    trackGatewayById(index: number, item: Gateway) {
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
        private route: ActivatedRoute,
        private flowPopupService: FlowPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.flowPopupService
                    .open(FlowDialogComponent as Component, params['id']);
            } else {
                this.flowPopupService
                    .open(FlowDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
