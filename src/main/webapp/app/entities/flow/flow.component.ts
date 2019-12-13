import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { EndpointType } from '../../shared/camel/component-type';

import { IFlow } from 'app/shared/model/flow.model';
import { AccountService } from 'app/core';

import { ITEMS_PER_PAGE } from 'app/shared';
import { FlowService } from './flow.service';
import { IGateway, GatewayType, EnvironmentType } from 'app/shared/model/gateway.model';
import { FromEndpointService } from '../from-endpoint';
import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';
import { GatewayService } from '../gateway';

@Component({
    selector: 'jhi-flow',
    templateUrl: './flow.component.html'
})

export class FlowComponent implements OnInit, OnDestroy {

    public isAdmin: boolean;
    gateways: IGateway[];
    gateway: IGateway;
    flows: IFlow[];
    flow: IFlow;
    fromEndpoints: IFromEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number = -1;
    gatewayExists = false;
    multipleGateways = false;
    finished = false;

    singleGatewayName: string;
    singleGatewayId: number;
    singleGatewayStage: string;
    flowActions = ['start', 'stop', 'pause', 'restart', 'resume'];
    selectedAction: string;
    test: any;
    searchText: string = '';
    
    constructor(
        protected flowService: FlowService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected parseLinks: JhiParseLinks,
        protected accountService: AccountService,
		protected gatewayService: GatewayService,
        protected fromEndpointService: FromEndpointService,
        protected router: Router,
    ) {
        this.flows = [];
        this.itemsPerPage = ITEMS_PER_PAGE + 5;
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
            })
            .subscribe(
                (res: HttpResponse<IFlow[]>) => this.onSuccess(res.body, res.headers),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        }
    }    

    reset() {
        this.page = 0;
        this.flows = [];
        this.loadFlows();
    }

    loadPage(page) {
        this.page = 0 //page;
        this.itemsPerPage = this.itemsPerPage + 5; 
        this.loadFlows();
    }

    ngOnInit() {
        this.getGateways();
        this.getFromEndpoints();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
            this.flowService.connect();
        });
        this.finished = true;
        this.accountService.hasAuthority('ROLE_ADMIN').then((r) => this.isAdmin = r);
        this.registerChangeInFlows();
        this.registerChangeCreatedGateway();
        this.registerDeletedFlows();
    }
    
    ngAfterViewInit() {
        this.finished = true;
      }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    getFlowsForSelectedGateway(id) {
        this.flowService.getFlowByGatewayId(Number(id))
            .subscribe(
            res => this.onSuccess(res, res.headers),
            res => this.onError(res.json)
            );
    }

    getGateways(): void {
        this.gatewayService.query()
            .subscribe(gateways => {
                this.gateways = gateways.body;
                this.isGatewayCreated(this.gateways);

                if (this.gatewayExists) {

                    this.gateway = new Object();
                    this.gateway.name = 'default';
                    this.gateway.type = GatewayType.ADAPTER;
                    this.gateway.environmentName = 'Dev1';
                    this.gateway.stage = EnvironmentType.DEVELOPMENT;
                    this.gateway.defaultFromEndpointType = EndpointType.FILE;
                    this.gateway.defaultToEndpointType = EndpointType.FILE;
                    this.gateway.defaultErrorEndpointType = EndpointType.FILE;

                    this.gatewayService.create(this.gateway)
                        .subscribe(gateway => {
                            this.gateway = gateway.body;
                            this.gateways.push(this.gateway);
                            this.gatewayExists = true;
                            this.singleGatewayName = gateway.body.name;
                            this.singleGatewayId = gateway.body.id;
                            this.singleGatewayStage = gateway.body.stage ? gateway.body.stage.toString().toLowerCase() : '';
                        });
                } else {
                    this.loadFlows();
                    if (!this.multipleGateways) {
                        this.singleGatewayName = this.gateways[0].name;
                        this.singleGatewayId = this.gateways[0].id;
                        this.singleGatewayStage = this.gateways[0].stage ? this.gateways[0].stage.toString().toLowerCase() : '';
                    }
                }
            });
    }

    isGatewayCreated(gateways: IGateway[]): void {
        this.gatewayExists = gateways.length === 0;
        this.multipleGateways = gateways.length > 1;
    }

    getFromEndpoints(): void {

        this.fromEndpointService.query()
            .subscribe(data => {
                this.fromEndpoints = data.body;
            });
    }

    trackId(index: number, item: IFlow) {
        return item.id;
    }

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.reset());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'name') {
            result.push('name');
        }
        return result;
    }

    registerChangeCreatedGateway() {
        this.eventSubscriber = this.eventManager.subscribe('gatewayCreated', response => {
            this.gatewayExists = false;
            this.getGateways();
        });
    }

    registerDeletedFlows() {

    this.eventManager.subscribe('flowDeleted', (res) => {
                this.loadFlows();
            }
        );        
    }

    trigerAction(selectedAction: string) {
        this.eventManager.broadcast({ name: 'trigerAction', content: selectedAction });
    }

    navigateToFlow() {
        this.router.navigate(['../../flow/edit-all'])
    }
    
    
    private onSuccess(data, headers) {
        if (this.gateways.length === 1) {
            this.links = this.parseLinks.parse(headers.get('link'));
        }
        this.flows = new Array<IFlow>();
        for (let i = 0; i < data.length; i++) {
            this.flows.push(data[i]);
        }
        this.totalItems = headers.get('X-Total-Count');
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
