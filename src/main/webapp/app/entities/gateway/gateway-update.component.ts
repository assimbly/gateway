import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IGateway, EnvironmentType, GatewayType } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';
import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { WireTapEndpointService } from 'app/entities/wire-tap-endpoint';
import { ComponentType, Components } from '../../shared/camel/component-type';
import { Router } from '@angular/router';

@Component({
    selector: 'jhi-gateway-update',
    templateUrl: './gateway-update.component.html'
})
export class GatewayUpdateComponent implements OnInit {
    gateway: IGateway;
    isSaving: boolean;

    public gatewayListType = [GatewayType.FULL, GatewayType.BROKER, GatewayType.CONNECTOR];
    public gatewayListStage = [EnvironmentType.DEVELOPMENT, EnvironmentType.TEST, EnvironmentType.ACCEPTANCE, EnvironmentType.PRODUCTION];

    generalPopoverMessage: string;
    typePopoverMessage: string;
    environmentPopoverMessage: string;
    defaultPopoverMessage: string;
    wiretapEndpoints: IWireTapEndpoint[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected gatewayService: GatewayService,
        protected wireTapEndpointService: WireTapEndpointService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router,
        public components: Components
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ gateway }) => {
            this.gateway = gateway;
        });
        this.setPopoverMessages();
        if (typeof this.gateway.id === 'undefined') {
            this.gateway.type = GatewayType.FULL;
            this.gateway.stage = EnvironmentType.DEVELOPMENT;
            this.gateway.defaultFromComponentType = ComponentType.FILE;
            this.gateway.defaultToComponentType = ComponentType.FILE;
            this.gateway.defaultErrorComponentType = ComponentType.FILE;
        }

        this.wireTapEndpointService.query({ filter: 'gateway-is-null' }).subscribe(
            (res: HttpResponse<IWireTapEndpoint[]>) => {
                if (!this.gateway.wiretapEndpointId) {
                    this.wiretapEndpoints = res.body;
                } else {
                    this.wireTapEndpointService.find(this.gateway.wiretapEndpointId).subscribe(
                        (subRes: HttpResponse<IWireTapEndpoint>) => {
                            this.wiretapEndpoints = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        if (this.activatedRoute.fragment['value'] === 'clone') {
            this.gateway.id = null;
        }
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.gateway.id !== undefined) {
            this.subscribeToSaveResponse(this.gatewayService.update(this.gateway));
        } else {
            this.subscribeToSaveResponse(this.gatewayService.create(this.gateway));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IGateway>>) {
        result.subscribe(
            (res: HttpResponse<IGateway>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.router.navigate(['/gateway']);
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackWireTapEndpointById(index: number, item: IWireTapEndpoint) {
        return item.id;
    }

    setTypeGateway() {
        if (this.gateway.type.toString() === 'BROKER') {
            this.gateway.defaultFromComponentType = ComponentType.ACTIVEMQ;
            this.gateway.defaultToComponentType = ComponentType.ACTIVEMQ;
            this.gateway.defaultErrorComponentType = ComponentType.ACTIVEMQ;
        } else if (this.gateway.type.toString() === 'ARTEMIS') {
            this.gateway.defaultFromComponentType = ComponentType.SJMS;
            this.gateway.defaultToComponentType = ComponentType.SJMS;
            this.gateway.defaultErrorComponentType = ComponentType.SJMS;
        } else {
            this.gateway.defaultFromComponentType = ComponentType.FILE;
            this.gateway.defaultToComponentType = ComponentType.FILE;
            this.gateway.defaultErrorComponentType = ComponentType.FILE;
        }
    }

    setPopoverMessages() {
        this.generalPopoverMessage = `General settings of the gateway<br></br><b>Name: </b>
                    Name of the gateway. Usually this is the name of the default source or destination,
                        like an application or system.<br/><br/>
                     <b>Type: </b>The type of gateway: Connector or Broker. Full supports both. <br/><br/>Default is FULL.`;
        this.environmentPopoverMessage = `Type of gateway <br/></br>
                    <b/>Type: </b>The type of gateway: Connector or Broker. Full supports both. <br/><br/>Default is FULL.`;
        this.environmentPopoverMessage = `Environment settings of the gateway <br/></br>
                    <b/>Name: </b>Name to indicate the stage. Default="Dev1".
                    <b>Stage: </b>The role of the environment: development, test, acceptance or production. Default=Development`;
        this.defaultPopoverMessage = `Component settings of the gateway <br/></br>
                        Sets the default selected components when creating a flow. <br/><br/>
                        The component can always be changed when creating or editing a flow. <br/><br/> Default=FILE.`;
    }
}
