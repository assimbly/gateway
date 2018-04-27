import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
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
    singleGateway = false;
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
        } else if (!this.finished) {
            setTimeout(() => {
                this.flow = new Flow();
                this.fromEndpoint = new FromEndpoint();
                this.toEndpoint = new ToEndpoint();
                this.errorEndpoint = new ErrorEndpoint();
                this.finished = true;
            }, 0);
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
            .subscribe((gateways) => {
                this.gateways = gateways.json;
                this.singleGateway = this.gateways.length === 1;
            });
    }

    save() {

        this.isSaving = true;

        if (this.fromEndpoint.id !== undefined && this.errorEndpoint.id !== undefined && this.flow.id !== undefined) {

            const updateFlow = this.fromEndpointService.update(this.fromEndpoint)
            const updateFromEndpoint = this.errorEndpointService.update(this.errorEndpoint)
            const updateErrorEndpoint = this.flowService.update(this.flow)
            const updateToEndpoint = this.toEndpointService.update(this.toEndpoint);

            forkJoin([updateFlow, updateFromEndpoint, updateErrorEndpoint, updateToEndpoint]).subscribe((results) => {
                console.log('flow updated');
                this.isSaving = false;
            });
        }else {
            if (this.singleGateway) {
                this.flow.gatewayId = this.gateways[0].id;
            }
            const saveFlow = this.flowService.create(this.flow);
            const saveFromEndpoint = this.fromEndpointService.create(this.fromEndpoint);
            const saveErrorEndpoint = this.errorEndpointService.create(this.errorEndpoint);
            const saveToEndpoint = this.toEndpointService.create(this.toEndpoint);

            forkJoin([saveFlow, saveFromEndpoint, saveErrorEndpoint, saveToEndpoint]).subscribe((results) => {

                if (results[0].id > 0 && results[0].id > 0 && results[2].id > 0 && results[3].id > 0) {

                    // update flow (set from and error ids)
                    this.flow = results[0];
                    this.flow.fromEndpointId = results[1].id;
                    this.flow.errorEndpointId = results[2].id;
                    this.subscribeToSaveResponse(
                        this.flowService.update(this.flow)
                    );

                    // update toEndpoint (set flow id)
                    this.toEndpoint = results[3];
                    this.toEndpoint.flowId = results[0].id;
                    this.subscribeToSaveResponse(
                        this.toEndpointService.update(this.toEndpoint)
                    );
                    console.log('flow created');
                    this.finished = true;
                    this.isSaving = false;
                } else {
                    console.log('flow not created');
                }
            });
        }
    }

    navigateToServices() {
        this.router.navigate(['service']);
    }

    navigateToHeaders() {
        this.router.navigate(['header']);
    }

    private subscribeToSaveResponse(result: Observable<Flow>) {
        result.subscribe((res: Flow) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError()
        );
    }

    private onSaveSuccess(result: Flow) {
        this.eventManager.broadcast({ name: 'flowListModification', content: 'OK' });
        this.isSaving = false;
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
