import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IGateway, EnvironmentType, GatewayType } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';
import { Components } from '../../shared/camel/component-type';
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

    consumerComponentsNames: Array<any> = [];
    producerComponentsNames: Array<any> = [];

    generalPopoverMessage: string;
    typePopoverMessage: string;
    environmentPopoverMessage: string;
    defaultPopoverMessage: string;

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected gatewayService: GatewayService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router,
        public components: Components
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ gateway }) => {
            this.gateway = gateway;
        });

        this.setComponents();

        this.setPopoverMessages();

        if (typeof this.gateway.id === 'undefined') {
            this.gateway.type = GatewayType.FULL;
            this.gateway.stage = EnvironmentType.DEVELOPMENT;
            this.gateway.defaultFromComponentType = 'file';
            this.gateway.defaultToComponentType = 'file';
            this.gateway.defaultErrorComponentType = 'file';
        }

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

    setTypeGateway() {
        if (this.gateway.type.toString() === 'BROKER') {
            this.gateway.defaultFromComponentType = 'activemq';
            this.gateway.defaultToComponentType = 'activemq';
            this.gateway.defaultErrorComponentType = 'activemq';
        } else if (this.gateway.type.toString() === 'ARTEMIS') {
            this.gateway.defaultFromComponentType = 'amqp';
            this.gateway.defaultToComponentType = 'amqp';
            this.gateway.defaultErrorComponentType = 'amqp';
        } else {
            this.gateway.defaultFromComponentType = 'file';
            this.gateway.defaultToComponentType = 'file';
            this.gateway.defaultErrorComponentType = 'file';
        }
    }

    setComponents() {
        const producerComponents = this.components.types.filter(function(component) {
            return component.consumerOnly === false;
        });

        const consumerComponents = this.components.types.filter(function(component) {
            return component.producerOnly === false;
        });

        this.producerComponentsNames = producerComponents.map(component => component.name);
        this.producerComponentsNames.sort();

        this.consumerComponentsNames = consumerComponents.map(component => component.name);
        this.consumerComponentsNames.sort();
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
