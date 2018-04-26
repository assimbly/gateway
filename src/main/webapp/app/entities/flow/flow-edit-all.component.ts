import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ITEMS_PER_PAGE, Principal, ResponseWrapper } from '../../shared';

import { Flow } from './flow.model';
import { FlowService } from './flow.service';
import { FromEndpointComponent, FromEndpointService, FromEndpoint } from '../from-endpoint/';
import { ToEndpointService, ToEndpoint } from '../to-endpoint/';
import { ErrorEndpointComponent, ErrorEndpointService, ErrorEndpoint } from '../error-endpoint/';
import { Gateway, GatewayService } from '../gateway';
import { Service, ServiceService } from '../service';
import { Header, HeaderService } from '../header';

@Component({
    selector: 'jhi-flow-edit-all',
    templateUrl: './flow-edit-all.component.html'
})
export class FlowEditAllComponent implements OnInit, OnDestroy {

    flow: Flow;
    fromEndpoint: FromEndpoint;
    toEndpoint: ToEndpoint;
    errorEndpoint: ErrorEndpoint;
    toEndpoints: ToEndpoint[];
    services: Service[];
    headers: Header[];
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
        private gatewayService: GatewayService,
        private flowService: FlowService,
        private fromEndpointService: FromEndpointService,
        private toEndpointService: ToEndpointService,
        private errorEndpointService: ErrorEndpointService,
        private serviceService: ServiceService,
        private headerService: HeaderService,
        private jhiAlertService: JhiAlertService,
        private route: ActivatedRoute,
        private router: Router
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
        this.registerChangeInFlows();
    }

    load(id) {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => { this.services = res.json; },
            (res: ResponseWrapper) => this.onError(res.json)
        );

        this.headerService.query().subscribe(
            (res: ResponseWrapper) => { this.headers = res.json; },
            (res: ResponseWrapper) => this.onError(res.json)
        );

        this.getGateways();

        if (id) {
            this.flowService.find(id).subscribe((flow) => {
                if (flow) {
                    this.flow = flow;
                    if (this.flow.fromEndpointId) {
                        this.fromEndpointService.find(this.flow.fromEndpointId).subscribe((fromEndpoint) => {
                            if (fromEndpoint) {
                                this.fromEndpoint = fromEndpoint;
                                this.finished = true;
                            }
                        });
                    }
                }

                if (this.flow.errorEndpointId) {
                    this.errorEndpointService.find(this.flow.errorEndpointId).subscribe((errorEndpoint) => {
                        this.errorEndpoint = errorEndpoint;
                    });
                }

                this.toEndpointService.findByFlowId(id).subscribe((toEndpoint) => {
                    this.toEndpoint = toEndpoint;
                });

            });
        } else {

            if (!this.finished) {

                setTimeout(() => {
                    this.flow = new Flow();
                    this.fromEndpoint = new FromEndpoint();
                    this.toEndpoint = new ToEndpoint();
                    this.errorEndpoint = new ErrorEndpoint();
                    this.finished = true;
                }, 0);
            } else if (this.createRoute === 4) {
                this.createRoute += 1;
                this.flow.id = this.newId;
                this.toEndpoint.flowId = this.flow.id;

                this.subscribeToSaveResponse(
                    this.flowService.update(this.flow)
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

    registerChangeInFlows() {
        this.eventSubscriber = this.eventManager.subscribe(
            'flowListModification',
            (response) => this.load(this.flow.id)
        );
    }

    getGateways() {
        this.gatewayService.query()
            .subscribe((gateways) => this.gateways = gateways.json);
    }

    save() {
        this.isSaving = true;
        if (this.fromEndpoint.id !== undefined && this.errorEndpoint.id !== undefined && this.flow.id !== undefined) {

            this.subscribeToSaveResponse(
                this.fromEndpointService.update(this.fromEndpoint)
            );

            this.subscribeToSaveResponse(
                this.errorEndpointService.update(this.errorEndpoint)
            );

            this.subscribeToSaveResponse(
                this.flowService.update(this.flow)
            );

            this.subscribeToSaveResponse(
                this.toEndpointService.update(this.toEndpoint)
            );
        } else if (this.fromEndpoint.id === undefined && this.errorEndpoint.id === undefined && this.flow.id === undefined) {

            this.subscribeToSaveFlowResponse(
                this.flowService.create(this.flow)
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

    navigateToServices() {
        this.router.navigate(['service']);
    }

    navigateToHeaders() {
        this.router.navigate(['header']);
    }

    private subscribeToSaveFlowResponse(result: Observable<Flow>) {
        result.subscribe((res: Flow) =>
            this.onSaveSuccessFlow(res), (res: Response) => this.onSaveError());
    }

    private subscribeToSaveResponse(result: Observable<Flow>) {
        result.subscribe((res: Flow) =>
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

    private onSaveSuccess(result: Flow) {
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
        this.isSaving = false;
    }

    private onSaveSuccessFlow(result: Flow) {
        this.newId = result.id;
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
    }

    private onSaveSuccessFromEndpoint(result: FromEndpoint) {
        this.flow.fromEndpointId = result.id;
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
    }

    private onSaveSuccessErrorEndpoint(result: ErrorEndpoint) {
        this.flow.errorEndpointId = result.id;
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
    }

    private onSaveSuccessToEndpoint(result: ToEndpoint) {
        this.createRoute += 1;
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
