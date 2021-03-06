import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFlow, Flow } from 'app/shared/model/flow.model';
import { Endpoint } from 'app/shared/model/endpoint.model';
import { Gateway } from 'app/shared/model/gateway.model';

import { FlowService } from './flow.service';
import { EndpointService } from '../endpoint';
import { GatewayService } from '../gateway';
import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import { ComponentType, typesLinks } from '../../shared/camel/component-type';
import { JhiEventManager } from 'ng-jhipster';
import { Subscription } from 'rxjs';

@Component({
    selector: 'jhi-flow-detail',
    templateUrl: './flow-detail.component.html',
    providers: [NgbTabsetConfig]
})
export class FlowDetailComponent implements OnInit {
    flow: IFlow;
    gateway: Gateway;
    endpoints: Array<Endpoint>;

    // typesLinks: Array<TypeLinks>;

    fromTypeAssimblyLink: string;
    fromTypeCamelLink: string;
    componentTypeAssimblyLinks: Array<string> = [];
    componentTypeCamelLinks: Array<string> = [];
    errorTypeAssimblyLink: string;
    errorTypeCamelLink: string;

    private subscription: Subscription;
    private eventSubscriber: Subscription;
    private wikiDocUrl: string;
    private camelDocUrl: string;

    constructor(
        public tabsetConfig: NgbTabsetConfig,
        protected gatewayService: GatewayService,
        protected endpointService: EndpointService,
        protected eventManager: JhiEventManager,
        protected flowService: FlowService,
        protected activatedRoute: ActivatedRoute
    ) {
        tabsetConfig.justify = 'fill';
    }

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ flow }) => {
            this.flow = flow;
        });
    }

    load(id) {
        forkJoin([this.flowService.getWikiDocUrl(), this.flowService.getCamelDocUrl()]).subscribe(results => {
            this.wikiDocUrl = results[0].url;
            this.camelDocUrl = results[1].url;
        });

        this.flowService.find(id).subscribe(flow => {
            this.flow = flow.body;
            this.getGateway(flow.body.gatewayId);
            this.getEndpointByFlowId(flow.body.id);
        });
    }

    getGateway(id) {
        if (!id) {
            return;
        }

        this.gatewayService.find(id).subscribe(gateway => (this.gateway = gateway.body));
    }

    getEndpointByFlowId(id) {
        if (!id) {
            return;
        }

        this.endpointService.findByFlowId(id).subscribe(endpoints => {
            this.endpoints = endpoints.body;
            this.endpoints.forEach(endpoint => {
                this.setTypeLinks(endpoint);
            });
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
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.load(this.flow.id));
    }

    private setTypeLinks(endpoint: any) {
        let type;

        type = typesLinks.find(x => x.name === endpoint.componentType.toString());
        this.componentTypeAssimblyLinks[this.endpoints.indexOf(endpoint)] = this.wikiDocUrl + type.assimblyTypeLink;
        this.componentTypeCamelLinks[this.endpoints.indexOf(endpoint)] = this.camelDocUrl + type.camelTypeLink;
    }
}
