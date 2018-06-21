import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { ToEndpoint, ToEndpointService } from '../to-endpoint';
import { ErrorEndpoint, ErrorEndpointService } from '../error-endpoint';
import { GatewayService, Gateway } from '../gateway';
import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
    selector: 'jhi-flow-detail',
    templateUrl: './flow-detail.component.html',
    providers: [NgbTabsetConfig]
})
export class FlowDetailComponent implements OnInit, OnDestroy {

    flow: Flow;
    gateway: Gateway;
    fromEndpoint: FromEndpoint;
    toEndpoints: Array<ToEndpoint>;
    errorEndpoint: ErrorEndpoint;
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
        private gatewayService: GatewayService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private eventManager: JhiEventManager,
        private flowService: FlowService,
        private route: ActivatedRoute
    ) {
        tabsetConfig.justify = 'fill';
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInFlows();
    }

    load(id) {
        forkJoin([this.flowService.getWikiDocUrl(), this.flowService.getCamelDocUrl()])
        .subscribe((results) => {
            this.wikiDocUrl = results[0].text();
            this.camelDocUrl = results[1].text();
        });

        this.flowService.find(id).subscribe((flow) => {
            this.flow = flow;
            this.getGateway(flow.gatewayId);
            this.getFromEndpoint(flow.fromEndpointId);
            this.getToEndpointByFlowId(flow.id);
            this.getErrorEndpoint(flow.errorEndpointId);
        });
    }

    getGateway(id) {
        if (!id) { return; }

        this.gatewayService.find(id)
            .subscribe((gateway) => this.gateway = gateway);
    }

    getFromEndpoint(id) {
        if (!id) { return; }

        this.fromEndpointService.find(id)
            .subscribe((fromEndpoint) => {
                this.fromEndpoint = fromEndpoint;
                this.setTypeLinks(this.fromEndpoint);
            });
    }

    getToEndpointByFlowId(id) {
        if (!id) { return; }

        this.toEndpointService.findByFlowId(id)
            .subscribe((toEndpoints) => {
                this.toEndpoints = toEndpoints;
                this.toEndpoints.forEach((toEndpoint) => {
                    this.setTypeLinks(toEndpoint);
                });
            });
    }

    getErrorEndpoint(id) {
        if (!id) { return; }

        this.errorEndpointService.find(id)
            .subscribe((errorEndpoint) => {
                this.errorEndpoint = errorEndpoint;
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

        const typesLinks = [
            {
                name: 'ACTIVEMQ',
                assimblyTypeLink: `${this.wikiDocUrl}/component-activemq`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-jms/src/main/docs/jms-component.adoc`,
            },
            {
                name: 'FILE',
                assimblyTypeLink: `${this.wikiDocUrl}/component-file`,
                camelTypeLink: `${this.camelDocUrl}/camel-core/src/main/docs/file-component.adoc`,
            },
            {
                name: 'HTTP4',
                assimblyTypeLink: `${this.wikiDocUrl}/component-http4`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-http4/src/main/docs/http4-component.adoc`,
            },
            {
                name: 'KAFKA',
                assimblyTypeLink: `${this.wikiDocUrl}/component-kafka`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-kafka/src/main/docs/kafka-component.adoc`,
            },
            {
                name: 'SFTP',
                assimblyTypeLink: `${this.wikiDocUrl}/component-sftp`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-ftp/src/main/docs/sftp-component.adoc`,
            },
            {
                name: 'SJMS',
                assimblyTypeLink: `${this.wikiDocUrl}/component-sjms`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-sjms/src/main/docs/sjms-component.adoc`,
            },
            {
                name: 'SONICMQ',
                assimblyTypeLink: `${this.wikiDocUrl}/component-sonicmq`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-sjms/src/main/docs/sjms-component.adoc`,
            },
            {
                name: 'SQL',
                assimblyTypeLink: `${this.wikiDocUrl}/component-sql`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-sql/src/main/docs/sql-component.adoc`,
            },
            {
                name: 'STREAM',
                assimblyTypeLink: `${this.wikiDocUrl}/component-stream`,
                camelTypeLink: `${this.camelDocUrl}/components/camel-stream/src/main/docs/stream-component.adoc`,
            },
            {
                name: 'WASTEBIN',
                assimblyTypeLink: `${this.wikiDocUrl}/component-wastebin`,
                camelTypeLink:  `${this.camelDocUrl}/camel-core/src/main/docs/mock-component.adoc`,
            }
        ];

        let type;
        if (endpoint instanceof FromEndpoint) {
            type = typesLinks.find((x) => x.name === endpoint.type.toString());
            this.fromTypeAssimblyLink = type.assimblyTypeLink;
            this.fromTypeCamelLink = type.camelTypeLink;
        } else if (endpoint instanceof ToEndpoint) {
            type = typesLinks.find((x) => x.name === endpoint.type.toString());
            this.toTypeAssimblyLinks[this.toEndpoints.indexOf(endpoint)] = type.assimblyTypeLink;
            this.toTypeCamelLinks[this.toEndpoints.indexOf(endpoint)] = type.camelTypeLink;
        } else if (endpoint instanceof ErrorEndpoint) {
            type = typesLinks.find((x) => x.name === endpoint.type.toString());
            this.errorTypeAssimblyLink = type.assimblyTypeLink;
            this.errorTypeCamelLink = type.camelTypeLink;
        }

    }

}
