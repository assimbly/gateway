import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IIntegration, EnvironmentType, GatewayType } from 'app/shared/model/integration.model';
import { IntegrationService } from './integration.service';
import { Components } from '../../shared/camel/component-type';
import { Router } from '@angular/router';

@Component({
    selector: 'jhi-integration-update',
    templateUrl: './integration-update.component.html'
})
export class IntegrationUpdateComponent implements OnInit {
    integration: IIntegration;
    isSaving: boolean;

    public integrationListType = [GatewayType.FULL, GatewayType.BROKER, GatewayType.CONNECTOR];
    public integrationListStage = [EnvironmentType.DEVELOPMENT, EnvironmentType.TEST, EnvironmentType.ACCEPTANCE, EnvironmentType.PRODUCTION];

    consumerComponentsNames: Array<any> = [];
    producerComponentsNames: Array<any> = [];

    generalPopoverMessage: string;
    typePopoverMessage: string;
    environmentPopoverMessage: string;
    defaultPopoverMessage: string;

    constructor(
		protected alertService: AlertService,
        protected integrationService: IntegrationService,
        protected activatedRoute: ActivatedRoute,
        protected router: Router,
        public components: Components
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ integration }) => {
            this.integration = integration;
        });

        this.setComponents();

        this.setPopoverMessages();

        if (typeof this.integration.id === 'undefined') {
            this.integration.type = GatewayType.FULL;
            this.integration.stage = EnvironmentType.DEVELOPMENT;
            this.integration.defaultFromComponentType = 'file';
            this.integration.defaultToComponentType = 'file';
            this.integration.defaultErrorComponentType = 'file';
        }

        if (this.activatedRoute.fragment['value'] === 'clone') {
            this.integration.id = null;
        }
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.integration.id !== undefined) {
            this.subscribeToSaveResponse(this.integrationService.update(this.integration));
        } else {
            this.subscribeToSaveResponse(this.integrationService.create(this.integration));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IIntegration>>) {
        result.subscribe(
            (res: HttpResponse<IIntegration>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.router.navigate(['/integration']);
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    setTypeIntegration() {
        if (this.integration.type.toString() === 'BROKER') {
            this.integration.defaultFromComponentType = 'activemq';
            this.integration.defaultToComponentType = 'activemq';
            this.integration.defaultErrorComponentType = 'activemq';
        } else if (this.integration.type.toString() === 'ARTEMIS') {
            this.integration.defaultFromComponentType = 'amqp';
            this.integration.defaultToComponentType = 'amqp';
            this.integration.defaultErrorComponentType = 'amqp';
        } else {
            this.integration.defaultFromComponentType = 'file';
            this.integration.defaultToComponentType = 'file';
            this.integration.defaultErrorComponentType = 'file';
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
        this.generalPopoverMessage = `General settings of the integration<br></br><b>Name: </b>
                    Name of the integration. Usually this is the name of the default source or destination,
                        like an application or system.<br/><br/>
                     <b>Type: </b>The type of integration: Connector or Broker. Full supports both. <br/><br/>Default is FULL.`;
        this.environmentPopoverMessage = `Type of integration <br/></br>
                    <b/>Type: </b>The type of integration: Connector or Broker. Full supports both. <br/><br/>Default is FULL.`;
        this.environmentPopoverMessage = `Environment settings of the integration <br/></br>
                    <b/>Name: </b>Name to indicate the stage. Default="Dev1".
                    <b>Stage: </b>The role of the environment: development, test, acceptance or production. Default=Development`;
        this.defaultPopoverMessage = `Component settings of the integration <br/></br>
                        Sets the default selected components when creating a flow. <br/><br/>
                        The component can always be changed when creating or editing a flow. <br/><br/> Default=FILE.`;
    }
}
