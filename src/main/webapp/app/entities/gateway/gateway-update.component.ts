import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IGateway, EnvironmentType, GatewayType } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';
import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { WireTapEndpointService } from 'app/entities/wire-tap-endpoint';
import { EndpointType, Components } from '../../shared/camel/component-type';
import { Router } from "@angular/router";

@Component({
    selector: 'jhi-gateway-update',
    templateUrl: './gateway-update.component.html'
})
export class GatewayUpdateComponent implements OnInit {
    gateway: IGateway;
    isSaving: boolean;

    public gatewayListType = [GatewayType.ADAPTER, GatewayType.BROKER, GatewayType.ARTEMIS];
    public gatewayListStage = [EnvironmentType.DEVELOPMENT, EnvironmentType.TEST, EnvironmentType.ACCEPTANCE, EnvironmentType.PRODUCTION]
    
    generalPopoverMessage: string;
    environmentPopoverMessage: string;
    defaultPopoverMessage: string;
    wiretapEndpoints: IWireTapEndpoint[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected gatewayService: GatewayService,
        protected wireTapEndpointService: WireTapEndpointService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router,
        protected components: Components
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ gateway }) => {
            this.gateway = gateway;
        });
        this.setPopoverMessages();
        if (typeof this.gateway.id === 'undefined') {
            this.gateway.type = GatewayType.ADAPTER;
            this.gateway.stage = EnvironmentType.DEVELOPMENT;
            this.gateway.defaultFromEndpointType = EndpointType.FILE;
            this.gateway.defaultToEndpointType = EndpointType.FILE;
            this.gateway.defaultErrorEndpointType = EndpointType.FILE;
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
        result.subscribe((res: HttpResponse<IGateway>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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
            this.gateway.defaultFromEndpointType = EndpointType.ACTIVEMQ;
            this.gateway.defaultToEndpointType = EndpointType.ACTIVEMQ;
            this.gateway.defaultErrorEndpointType = EndpointType.ACTIVEMQ;
        }else if(this.gateway.type.toString() === 'ARTEMIS') {
            this.gateway.defaultFromEndpointType = EndpointType.SJMS;
            this.gateway.defaultToEndpointType = EndpointType.SJMS;
            this.gateway.defaultErrorEndpointType = EndpointType.SJMS;
        }else{
            this.gateway.defaultFromEndpointType = EndpointType.FILE;
            this.gateway.defaultToEndpointType = EndpointType.FILE;
            this.gateway.defaultErrorEndpointType = EndpointType.FILE;
        } 
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