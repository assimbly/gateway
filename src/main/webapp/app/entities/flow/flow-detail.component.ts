import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFlow, Flow } from 'app/shared/model/flow.model';
import { FromEndpoint } from 'app/shared/model/from-endpoint.model';
import { ToEndpoint } from 'app/shared/model/to-endpoint.model';
import { ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { Gateway } from 'app/shared/model/gateway.model';

import { FlowService } from './flow.service';
import { FromEndpointService } from '../from-endpoint';
import { ToEndpointService } from '../to-endpoint';
import { ErrorEndpointService } from '../error-endpoint';
import { GatewayService} from '../gateway';
import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import { EndpointType, typesLinks } from '../../shared/camel/component-type';
import { JhiEventManager } from "ng-jhipster";
import { Subscription } from "rxjs";

@Component({
    selector: 'jhi-flow-detail',
    templateUrl: './flow-detail.component.html',
    providers: [NgbTabsetConfig]
})
export class FlowDetailComponent implements OnInit {
    flow: IFlow;
    gateway: Gateway;
    fromEndpoint: FromEndpoint;
    toEndpoints: Array<ToEndpoint>;
    errorEndpoint: ErrorEndpoint;

    // typesLinks: Array<TypeLinks>;

    fromTypeAssimblyLink: string;
    fromTypeCamelLink: string;
    toTypeAssimblyLinks: Array<string> = [];
    toTypeCamelLinks: Array<string> = [];
    errorTypeAssimblyLink: string;
    errorTypeCamelLink: string;

    private subscription: Subscription;
    private eventSubscriber: Subscription;
    private wikiDocUrl: string;
    private camelDocUrl: string;

    constructor(
		public tabsetConfig: NgbTabsetConfig,
        protected gatewayService: GatewayService,
        protected fromEndpointService: FromEndpointService,
        protected toEndpointService: ToEndpointService,
        protected errorEndpointService: ErrorEndpointService,
        protected eventManager: JhiEventManager,
        protected flowService: FlowService,
		protected activatedRoute: ActivatedRoute
	){
        tabsetConfig.justify = 'fill';
	}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ flow }) => {
            this.flow = flow;
        });
    }
    
    load(id) {
        forkJoin([this.flowService.getWikiDocUrl(), this.flowService.getCamelDocUrl()])
            .subscribe((results) => {
                this.wikiDocUrl = results[0].url;
                this.camelDocUrl = results[1].url;
            });

        this.flowService.find(id).subscribe((flow) => {
            this.flow = flow.body;
            this.getGateway(flow.body.gatewayId);
            this.getFromEndpoint(flow.body.fromEndpointId);
            this.getToEndpointByFlowId(flow.body.id);
            this.getErrorEndpoint(flow.body.errorEndpointId);
        });
    }

    getGateway(id) {
        if (!id) { return; }

        this.gatewayService.find(id)
            .subscribe(gateway => this.gateway = gateway.body);
    }

    getFromEndpoint(id) {
        if (!id) { return; }

        this.fromEndpointService.find(id)
            .subscribe(fromEndpoint => {
                this.fromEndpoint = fromEndpoint.body;
                this.setTypeLinks(this.fromEndpoint);
            });
    }

    getToEndpointByFlowId(id) {
        if (!id) { return; }

        this.toEndpointService.findByFlowId(id)
            .subscribe(toEndpoints => {
                
                this.toEndpoints = toEndpoints.body;
                this.toEndpoints.forEach((toEndpoint) => {
                    this.setTypeLinks(toEndpoint);
                });
            });
    }

    getErrorEndpoint(id) {
        if (!id) { return; }

        this.errorEndpointService.find(id)
            .subscribe((errorEndpoint) => {
                this.errorEndpoint = errorEndpoint.body;
                this.setTypeLinks(this.errorEndpoint);
            });
    }

    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe(
            'flowListModification',
            (response) => this.load(this.flow.id)
        );
    }

    private setTypeLinks(endpoint: any) {

        let type;

        if (endpoint instanceof FromEndpoint) {
            type = typesLinks.find((x) => x.name === endpoint.type.toString());
            this.fromTypeAssimblyLink = this.wikiDocUrl + type.assimblyTypeLink;
            this.fromTypeCamelLink = this.camelDocUrl + type.camelTypeLink;
        } else if (endpoint instanceof ToEndpoint) {
            type = typesLinks.find((x) => x.name === endpoint.type.toString());
            this.toTypeAssimblyLinks[this.toEndpoints.indexOf(endpoint)] = this.wikiDocUrl + type.assimblyTypeLink;
            this.toTypeCamelLinks[this.toEndpoints.indexOf(endpoint)] = this.camelDocUrl + type.camelTypeLink;
        } else if (endpoint instanceof ErrorEndpoint) {
            type = typesLinks.find((x) => x.name === endpoint.type.toString());
            this.errorTypeAssimblyLink = this.wikiDocUrl + type.assimblyTypeLink;
            this.errorTypeCamelLink = this.camelDocUrl + type.camelTypeLink;
        }

    }

}
