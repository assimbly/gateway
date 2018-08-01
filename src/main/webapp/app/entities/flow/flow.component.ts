import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';

import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { FromEndpoint, FromEndpointService } from '../from-endpoint';
import { GatewayService, Gateway } from '../gateway';

@Component({
    selector: 'jhi-flow',
    templateUrl: './flow.component.html'
})

export class FlowComponent implements OnInit, OnDestroy {

    public isAdmin: boolean;
    gateways: Gateway[];
    flows: Flow[];
    fromEndpoints: FromEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    queryCount: any;
    reverse: boolean;
    totalItems: number;
    gatewayExists = false;
    multipleGateways = false;
    singleGatewayName: string;
    singleGatewayStage: string;
    flowActions = ['start', 'stop', 'pause', 'restart', 'resume'];
    test: any;

    constructor(
        private gatewayService: GatewayService,
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private parseLinks: JhiParseLinks,
        private principal: Principal,
        private router: Router,

    ) {
        this.flows = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'name';
        this.reverse = true;
    }

    loadFlows() {
        if (this.gateways.length > 1) {
            this.getFlowsForSelectedGateway(this.gateways[0].id);
        } else {
            this.flowService.query({
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            }).subscribe(
                (res: ResponseWrapper) => this.onSuccess(res.json, res.headers),
                (res: ResponseWrapper) => this.onError(res.json)
                );
        }
    }

    reset() {
        this.page = 0;
        this.flows = [];
        this.loadFlows();
    }

    loadPage(page) {
        this.page = page;
        this.loadFlows();
    }

    ngOnInit() {
        this.checkPrincipal();
        this.getGateways();
        this.getFromEndpoints();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInFlows();
        this.registerChangeCreatedGateway();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    getFlowsForSelectedGateway(id) {
        this.flowService.getFlowByGatewayId(Number(id))
            .subscribe(
            (res: ResponseWrapper) => this.onSuccess(res.json, res.headers),
            (res: ResponseWrapper) => this.onError(res.json)
            )
    }

    getGateways(): void {
        this.gatewayService.query()
            .subscribe((gateways) => {
                this.gateways = gateways.json
                this.isGatewayCreated(this.gateways);
                this.loadFlows();
                if (!this.multipleGateways) {
                    this.singleGatewayName = this.gateways[0].name;
                    this.singleGatewayStage = this.gateways[0].stage ? this.gateways[0].stage.toString().toLowerCase() : '';
                }
            });
    }

    isGatewayCreated(gateways: Gateway[]): void {
        this.gatewayExists = gateways.length === 0;
        this.multipleGateways = gateways.length > 1;
    }

    getFromEndpoints(): void {

        this.fromEndpointService.query()
            .subscribe((data) => {
                this.fromEndpoints = data.json;
            });
    }

    trackId(index: number, item: Flow) {
        return item.id;
    }
    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', (response) => this.reset());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'name') {
            result.push('name');
        }
        return result;
    }

    registerChangeCreatedGateway() {
        this.eventSubscriber = this.eventManager.subscribe('gatewayCreated', (response) => this.gatewayExists = false);
    }

    trigerAction(action: string) {
        this.eventManager.broadcast({ name: 'trigerAction', content: action });
    }

    private checkPrincipal() {
        this.principal.hasAuthority('ROLE_ADMIN').then((r) => this.isAdmin = r);
    }

    private onSuccess(data, headers) {
        if (this.gateways.length === 1) {
            this.links = this.parseLinks.parse(headers.get('link'));
        }
        this.totalItems = headers.get('X-Total-Count');
        this.flows = new Array<Flow>();
        for (let i = 0; i < data.length; i++) {
            this.flows.push(data[i]);
        }
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
