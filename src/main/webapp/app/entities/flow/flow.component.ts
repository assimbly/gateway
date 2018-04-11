import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';

import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { FromEndpoint } from '../from-endpoint/from-endpoint.model';
import { FromEndpointService } from '../from-endpoint/from-endpoint.service';
import { ToEndpoint } from '../to-endpoint/to-endpoint.model';
import { ToEndpointService } from '../to-endpoint/to-endpoint.service';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-flow',
    templateUrl: './flow.component.html'
})

export class FlowComponent implements OnInit, OnDestroy {

    flows: Flow[];
    fromEndpoints: FromEndpoint[];
    toEndpoints: ToEndpoint[];
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number;

    constructor(
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private parseLinks: JhiParseLinks,
        private principal: Principal
    ) {
        this.flows = [];
        this.fromEndpoints = [];
        this.toEndpoints = [];
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'id';
        this.reverse = true;
    }

    loadAll() {
        this.flowService.query({
            page: this.page,
            size: this.itemsPerPage,
            sort: this.sort()
        }).subscribe(
            (res: ResponseWrapper) => this.onSuccess(res.json, res.headers),
            (res: ResponseWrapper) => this.onError(res.json)
            );

        this.fromEndpointService.query().subscribe(
            (res: ResponseWrapper) => {
                this.fromEndpoints = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );

        this.toEndpointService.query().subscribe(
            (res: ResponseWrapper) => {
                this.toEndpoints = res.json;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    reset() {
        this.page = 0;
        this.flows = [];
        this.fromEndpoints = [];
        this.toEndpoints = [];
        this.loadAll();
    }

    start(id: number) {

        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.start(id).subscribe((response) => {
                            this.eventManager.broadcast({
                                name: 'flowListModification',
                                content: 'Start an flow'
                            });
                        });
                    });
            });
    }

    restart(id: number) {

        this.flowService.getConfiguration(id)
            .map((response) => response.text())
            .subscribe((data) => {
                this.flowService.setConfiguration(id, data)
                    .map((response) => response.text())
                    .subscribe((data2) => {
                        console.log('data' + data2);
                        this.flowService.restart(id).subscribe((response) => {
                            this.eventManager.broadcast({
                                name: 'flowListModification',
                                content: 'Restart an flow'
                            });
                        });
                    });
            });

    }

    stop(id: number) {
        this.flowService.stop(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'flowListModification',
                content: 'Stop an flow'
            });
        });
    }

    getFromEndpointType(id: number) {
        const fromEndpoint = this.fromEndpoints.find(function(obj) { return obj.id === id; });
        if (fromEndpoint !== undefined) { return fromEndpoint.type; };
    }

    getToEndpointType(id: number) {
        const toEndpoint = this.toEndpoints.find(function(obj) { return obj.id === id; });
        if (toEndpoint !== undefined) { return toEndpoint.type; };
    }

    loadPage(page) {
        this.page = page;
        this.loadAll();
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInFlows();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
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

    private onSuccess(data, headers) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        for (let i = 0; i < data.length; i++) {
            this.flows.push(data[i]);
        }
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
