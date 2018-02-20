import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';

import { CamelRoute } from './camel-route.model';
import { CamelRouteService } from './camel-route.service';
import { FromEndpoint } from '../from-endpoint/from-endpoint.model';
import { FromEndpointService } from '../from-endpoint/from-endpoint.service';
import { ToEndpoint } from '../to-endpoint/to-endpoint.model';
import { ToEndpointService } from '../to-endpoint/to-endpoint.service';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-camel-route',
    templateUrl: './camel-route.component.html'
})

export class CamelRouteComponent implements OnInit, OnDestroy {

    camelRoutes: CamelRoute[];
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
        private camelRouteService: CamelRouteService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private parseLinks: JhiParseLinks,
        private principal: Principal
    ) {
        this.camelRoutes = [];
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
        this.camelRouteService.query({
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
        this.camelRoutes = [];
        this.fromEndpoints = [];
        this.toEndpoints = [];
        this.loadAll();
    }

    start(id: number) {
        this.camelRouteService.start(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'camelRouteListModification',
                content: 'Start an camelRoute'
            });
        });
    }

    restart(id: number) {
        this.camelRouteService.restart(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'camelRouteListModification',
                content: 'Restart an camelRoute'
            });
        });
    }

    stop(id: number) {
        this.camelRouteService.stop(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'camelRouteListModification',
                content: 'Stop an camelRoute'
            });
        });
    }

    getFromEndpointType(id: number) {
        const fromEndpoint = this.fromEndpoints.find(function(obj) { return obj.id === id; });
        if (fromEndpoint !== undefined) { return fromEndpoint.type; };
    }

    getToEndpointType(id: number) {
        const toEndpoint = this.toEndpoints.find(function(obj) { return obj.camelRouteId === id; });
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
        this.registerChangeInCamelRoutes();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: CamelRoute) {
        return item.id;
    }
    registerChangeInCamelRoutes() {
        this.eventSubscriber = this.eventManager.subscribe('camelRouteListModification', (response) => this.reset());
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
            this.camelRoutes.push(data[i]);
        }
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
