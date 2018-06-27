import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';

import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';
import { GatewayService, Gateway } from '../gateway';

@Component({
    selector: 'jhi-flow',
    templateUrl: './flow.component.html'
})

export class FlowComponent implements OnInit, OnDestroy {

    gateways: Gateway[];
    flows: Flow[];
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number;
    gatewayExists = false;
    multipleGateways = false;
    singleGatewayName: string;
    flowActions = ['start', 'stop', 'pause', 'restart', 'resume'];
    test: any;

    constructor(
        private gatewayService: GatewayService,
        private flowService: FlowService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private parseLinks: JhiParseLinks,
        private principal: Principal
    ) {
        this.flows = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'id';
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
        this.getGateways();
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
                }
            });
    }

    isGatewayCreated(gateways: Gateway[]): void {
        this.gatewayExists = gateways.length === 0;
        this.multipleGateways = gateways.length > 1;
    }

    trackId(index: number, item: Flow) {
        return item.id;
    }
    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe('flowListModification', (response) => this.reset());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    registerChangeCreatedGateway() {
        this.eventSubscriber = this.eventManager.subscribe('gatewayCreated', (response) => this.gatewayExists = false);
    }

    trigerAction(action: string) {
        this.eventManager.broadcast({ name: 'trigerAction', content: action });
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
