import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';

import { CamelRoute } from './camel-route.model';
import { CamelRouteService } from './camel-route.service';
import { FromEndpointComponent, FromEndpointService, FromEndpoint } from '../from-endpoint/';
import { ToEndpointService, ToEndpoint } from '../to-endpoint/';
import { ErrorEndpointComponent, ErrorEndpointService, ErrorEndpoint } from '../error-endpoint/';
import { Gateway, GatewayService } from '../gateway';

@Component({
    selector: 'jhi-camel-route-edit-all',
    templateUrl: './camel-route-edit-all.component.html'
})
export class CamelRouteEditAllComponent implements OnInit, OnDestroy {

    camelRoute: CamelRoute;
    fromEndpoint: FromEndpoint;
    toEndpoint: ToEndpoint;
    errorEndpoint: ErrorEndpoint;
    toEndpoints: ToEndpoint[];
    isSaving: boolean;
    finished: boolean;
    gateways: Gateway[];
    createRoute: number;
    newId: number;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    queryCount: any;
    reverse: any;
    totalItems: number;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private camelRouteService: CamelRouteService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private jhiAlertService: JhiAlertService,
        private route: ActivatedRoute
    ) {
        this.toEndpoints = [];
    }

    ngOnInit() {
        this.isSaving = false;
        this.finished = false;
        this.createRoute = 0;

        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInCamelRoutes();
    }

    load(id) {
        if (id) {
            this.camelRouteService.find(id).subscribe((camelRoute) => {
                if (camelRoute) {
                    this.camelRoute = camelRoute;
                    if (this.camelRoute.fromEndpointId) {
                        this.fromEndpointService.find(this.camelRoute.fromEndpointId).subscribe((fromEndpoint) => {
                            if (fromEndpoint) {
                                this.fromEndpoint = fromEndpoint;
                                this.finished = true;
                            }
                        });

                    }
                }

                if (this.camelRoute.errorEndpointId) {
                    this.errorEndpointService.find(this.camelRoute.errorEndpointId).subscribe((errorEndpoint) => {
                        this.errorEndpoint = errorEndpoint;
                    });
                }

                this.toEndpointService.findByRouteId(id).subscribe((toEndpoint) => {
                    this.toEndpoint = toEndpoint;
                });

            });
        } else {

            if (!this.finished) {

                setTimeout(() => {
                    this.camelRoute = new CamelRoute();
                    this.fromEndpoint = new FromEndpoint();
                    this.toEndpoint = new ToEndpoint();
                    this.errorEndpoint = new ErrorEndpoint();
                    this.finished = true;
                }, 0);
            } else if (this.createRoute === 4) {
                this.createRoute += 1;
                this.camelRoute.id = this.newId;
                this.toEndpoint.camelRouteId = this.camelRoute.id;

                this.subscribeToSaveResponse(
                    this.camelRouteService.update(this.camelRoute)
                );
                this.subscribeToSaveResponse(
                    this.toEndpointService.update(this.toEndpoint)
                );
            }
        }
    }

    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInCamelRoutes() {
        this.eventSubscriber = this.eventManager.subscribe(
            'camelRouteListModification',
            (response) => this.load(this.camelRoute.id)
        );
    }

    save() {
        this.isSaving = true;
        if (this.fromEndpoint.id !== undefined && this.errorEndpoint.id !== undefined && this.camelRoute.id !== undefined) {
            this.subscribeToSaveResponse(
                this.errorEndpointService.update(this.errorEndpoint)
            );
            this.subscribeToSaveResponse(
                this.fromEndpointService.update(this.fromEndpoint)
            );
            this.subscribeToSaveResponse(
                this.camelRouteService.update(this.camelRoute)
            );
            this.subscribeToSaveResponse(
                this.toEndpointService.update(this.toEndpoint)
            );
        } else if (this.fromEndpoint.id === undefined && this.errorEndpoint.id === undefined && this.camelRoute.id === undefined) {

            this.subscribeToSaveCamelrouteResponse(
                this.camelRouteService.create(this.camelRoute)
            );

            this.subscribeToSaveFromEndpointResponse(
                this.fromEndpointService.create(this.fromEndpoint)
            );

            this.subscribeToSaveErrorEndpointResponse(
                this.errorEndpointService.create(this.errorEndpoint)
            );

            this.subscribeToSaveToEndpointResponse(
                this.toEndpointService.create(this.toEndpoint)
            );

        } else {
            this.onSaveError()
            console.log('Cannot save route');
        }

    }

    private subscribeToSaveCamelrouteResponse(result: Observable<CamelRoute>) {
        result.subscribe((res: CamelRoute) =>
            this.onSaveSuccessCamelRoute(res), (res: Response) => this.onSaveError());
    }

    private subscribeToSaveResponse(result: Observable<CamelRoute>) {
        result.subscribe((res: CamelRoute) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private subscribeToSaveFromEndpointResponse(result: Observable<FromEndpoint>) {
        result.subscribe((res: FromEndpoint) =>
            this.onSaveSuccessFromEndpoint(res), (res: Response) => this.onSaveError());
    }

    private subscribeToSaveErrorEndpointResponse(result: Observable<ErrorEndpoint>) {
        result.subscribe((res: ErrorEndpoint) =>
            this.onSaveSuccessErrorEndpoint(res), (res: Response) => this.onSaveError());
    }

    private subscribeToSaveToEndpointResponse(result: Observable<ToEndpoint>) {
        result.subscribe((res: ToEndpoint) =>
            this.onSaveSuccessToEndpoint(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: CamelRoute) {
        this.eventManager.broadcast({ name: 'camelRouteListModification', content: 'OK' });
        this.isSaving = false;
    }

    private onSaveSuccessCamelRoute(result: CamelRoute) {
        this.newId = result.id;
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'camelRouteListModification', content: 'OK' });
    }

    private onSaveSuccessFromEndpoint(result: FromEndpoint) {
        this.camelRoute.fromEndpointId = result.id;
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'camelRouteListModification', content: 'OK' });
    }

    private onSaveSuccessErrorEndpoint(result: ErrorEndpoint) {
        this.camelRoute.errorEndpointId = result.id;
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'camelRouteListModification', content: 'OK' });
    }

    private onSaveSuccessToEndpoint(result: ToEndpoint) {
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'camelRouteListModification', content: 'OK' });
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
