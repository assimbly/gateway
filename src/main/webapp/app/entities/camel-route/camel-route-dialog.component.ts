import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { CamelRoute } from './camel-route.model';
import { CamelRoutePopupService } from './camel-route-popup.service';
import { CamelRouteService } from './camel-route.service';
import { Gateway, GatewayService } from '../gateway';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-camel-route-dialog',
    templateUrl: './camel-route-dialog.component.html'
})
export class CamelRouteDialogComponent implements OnInit {

    camelRoute: CamelRoute;
    isSaving: boolean;

    gateways: Gateway[];

    fromendpoints: FromEndpoint[];

    errorendpoints: ErrorEndpoint[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private camelRouteService: CamelRouteService,
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
            .query({filter: 'camelroute-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.camelRoute.fromEndpointId) {
                    this.fromendpoints = res.json;
                } else {
                    this.fromEndpointService
                        .find(this.camelRoute.fromEndpointId)
                        .subscribe((subRes: FromEndpoint) => {
                            this.fromendpoints = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.errorEndpointService
            .query({filter: 'camelroute-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.camelRoute.errorEndpointId) {
                    this.errorendpoints = res.json;
                } else {
                    this.errorEndpointService
                        .find(this.camelRoute.errorEndpointId)
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
        if (this.camelRoute.id !== undefined) {
            this.subscribeToSaveResponse(
                this.camelRouteService.update(this.camelRoute));
        } else {
            this.subscribeToSaveResponse(
                this.camelRouteService.create(this.camelRoute));
        }
    }

    private subscribeToSaveResponse(result: Observable<CamelRoute>) {
        result.subscribe((res: CamelRoute) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: CamelRoute) {
        this.eventManager.broadcast({ name: 'camelRouteListModification', content: 'OK'});
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
    selector: 'jhi-camel-route-popup',
    template: ''
})
export class CamelRoutePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private camelRoutePopupService: CamelRoutePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.camelRoutePopupService
                    .open(CamelRouteDialogComponent as Component, params['id']);
            } else {
                this.camelRoutePopupService
                    .open(CamelRouteDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
