import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Gateway, GatewayType, EnvironmentType } from './gateway.model';
import { GatewayPopupService } from './gateway-popup.service';
import { GatewayService } from './gateway.service';
import { EndpointType, Components } from '../../shared/camel/component-type';

@Component({
    selector: 'jhi-gateway-dialog',
    templateUrl: './gateway-dialog.component.html'
})
export class GatewayDialogComponent implements OnInit {

    gateway: Gateway;
    isSaving: boolean;
    public gatewayListType = [GatewayType.ADAPTER, GatewayType.BROKER];
    public gatewayListStage = [EnvironmentType.ACCEPTANCE, EnvironmentType.DEVELOPMENT, EnvironmentType.PRODUCTION, EnvironmentType.TEST]

    constructor(
        public activeModal: NgbActiveModal,
        private gatewayService: GatewayService,
        private eventManager: JhiEventManager,
        private router: ActivatedRoute,
        public components: Components
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        if (typeof this.gateway.id === 'undefined') {
            this.gateway.defaultFromEndpointType = 'FILE';
            this.gateway.defaultToEndpointType = 'FILE';
            this.gateway.defaultErrorEndpointType = 'FILE';
        }
        if (this.router.fragment['value'] === 'clone') {
            this.gateway.id = null;
        }
        console.log(this.gatewayListType);
    }
    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.gateway.id !== undefined) {
            this.subscribeToSaveResponse(
                this.gatewayService.update(this.gateway), closePopup);
        } else {
            this.subscribeToSaveResponse(
                this.gatewayService.create(this.gateway), closePopup);
        }
    }
    private subscribeToSaveResponse(result: Observable<Gateway>, closePopup: boolean) {
        result.subscribe((res: Gateway) =>
            this.onSaveSuccess(res, closePopup), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Gateway, closePopup: boolean) {
        this.eventManager.broadcast({ name: 'gatewayListModification', content: 'OK' });
        this.eventManager.broadcast({ name: 'gatewayCreated', content: 'OK' });
        this.isSaving = false;
        if (closePopup) {
            this.activeModal.dismiss(result);
        }
    }
    setTypeGateway() {
        if (this.gateway.type.toString() === 'BROKER') {
            this.gateway.defaultFromEndpointType = EndpointType.ACTIVEMQ;
            this.gateway.defaultToEndpointType = EndpointType.ACTIVEMQ;
            this.gateway.defaultErrorEndpointType = EndpointType.ACTIVEMQ;
         }
    }
    private onSaveError() {
        this.isSaving = false;
    }
}

@Component({
    selector: 'jhi-gateway-popup',
    template: ''
})
export class GatewayPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private gatewayPopupService: GatewayPopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if (params['id']) {
                this.gatewayPopupService
                    .open(GatewayDialogComponent as Component, params['id']);
            } else {
                this.gatewayPopupService
                    .open(GatewayDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
