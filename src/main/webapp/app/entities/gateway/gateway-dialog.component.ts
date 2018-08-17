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
    public gatewayListStage = [EnvironmentType.DEVELOPMENT, EnvironmentType.TEST, EnvironmentType.ACCEPTANCE, EnvironmentType.PRODUCTION]

    generalPopoverMessage: string;
    environmentPopoverMessage: string;
    defaultPopoverMessage: string;

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
            this.gateway.type = GatewayType.ADAPTER;
            this.gateway.stage = EnvironmentType.DEVELOPMENT;
            this.gateway.defaultFromEndpointType = EndpointType.FILE;
            this.gateway.defaultToEndpointType = EndpointType.FILE;
            this.gateway.defaultErrorEndpointType = EndpointType.FILE;
        }
        if (this.router.fragment['value'] === 'clone') {
            this.gateway.id = null;
        }
        this.setPopoverMessages();
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save(closePopup: boolean) {
        this.isSaving = true;
        if (this.gateway.id !== undefined) {
            console.log(this.gateway);
            this.subscribeToSaveResponse(this.gatewayService.update(this.gateway), closePopup);
        } else {
            this.subscribeToSaveResponse(this.gatewayService.create(this.gateway), closePopup);
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

    setPopoverMessages() {

        this.generalPopoverMessage = `General settings of the gateway<br></br><b>Name: </b>
                    Name of the gateway. Usually this is the name of the default source or destination,
                        like an application or system.<br/><br/>
                     <b>Type: </b>If BROKER is chosen as the gateway type then an embedded ActiveMQ broker is started. <br/><br/>Default is ADAPTER.`;
        this.environmentPopoverMessage = `Environment settings of the gateway <br/></br>
                    <b/>Name: </b>Name to indicate the stage. Default="Dev1".
                    <b>Stage: </b>The role of the environment: development, test, acceptance or production. Default=Development`;
        this.defaultPopoverMessage = `Component settings of the gateway <br/></br>
                        Sets the default selected components when creating a flow. <br/><br/>
                        The component can always be changed when creating or editing a flow. <br/><br/> Default=FILE.`;
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
