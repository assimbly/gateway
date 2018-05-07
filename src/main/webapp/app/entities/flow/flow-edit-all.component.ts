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
    fromEndpointOptions: Array<Option> = new Array<Option>({key: '', value: ''});
    toEndpoint: ToEndpoint;
    toEndpointOptions: Array<Option> = new Array<Option>({key: '', value: ''});
    errorEndpoint: ErrorEndpoint;
    errorEndpointOptions: Array<Option> = new Array<Option>({key: '', value: ''});
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
    serviceCreated: boolean;
    headerCreated: boolean;
    types = ['ACTIVEMQ', 'FILE', 'HTTP4', 'KAFKA', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM', 'WASTEBIN'];

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
            (res: ResponseWrapper) => {
                this.services = res.json;
                this.serviceCreated = this.services.length > 0;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );

        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
                this.headerCreated = this.headers.length > 0;
            },
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
                                this.getOptions(this.fromEndpoint, null, null);
                                this.finished = true;
                            }
                        });
                    }
                }

                if (this.flow.errorEndpointId) {
                    this.errorEndpointService.find(this.flow.errorEndpointId).subscribe((errorEndpoint) => {
                        this.errorEndpoint = errorEndpoint;
                        this.getOptions(null, null, this.errorEndpoint);
                    });
                }

                this.toEndpointService.findByFlowId(id).subscribe((toEndpoints) => {
                    this.toEndpoint = toEndpoints[0];

                    this.getOptions(null, this.toEndpoint, null);
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

    getOptions(fromEndpoint?: FromEndpoint, toEndpoint?: ToEndpoint, errorEndpoint?: ErrorEndpoint) {
        const endpoint = fromEndpoint !== null ?
                fromEndpoint :
                toEndpoint !== null ?
                    toEndpoint :
                    errorEndpoint;

        if (endpoint.options === null) { return; }
        fromEndpoint !== null ?
            this.fromEndpointOptions = new Array<Option>() :
            toEndpoint !== null ?
                this.toEndpointOptions = new Array<Option>() :
                this.errorEndpointOptions = new Array<Option>();

        const options = endpoint.options.split('&');

        options.forEach((option) => {
            const kv = option.split('=');
            const o = new Option();
            o.key = kv[0];
            o.value = kv[1];
            fromEndpoint !== null ? this.fromEndpointOptions.push(o) : toEndpoint !== null ? this.toEndpointOptions.push(o) : this.errorEndpointOptions.push(o);
        });
    }

    setOptions() {
        let fromIndex = 0;
        this.fromEndpoint.options = '';
        this.fromEndpointOptions.forEach((fromOption) => {
             if (fromOption.key && fromOption.value) {
                this.fromEndpoint.options += fromIndex > 0 ? `,${fromOption.key}=${fromOption.value}` : `${fromOption.key}=${fromOption.value}`;
                fromIndex++;
             }
        });

        let toIndex = 0;
        this.toEndpoint.options = '';
        this.toEndpointOptions.forEach((toOption) => {
             if (toOption.key && toOption.value) {
                this.toEndpoint.options += toIndex > 0 ? `,${toOption.key}=${toOption.value}` : `${toOption.key}=${toOption.value}`;
                toIndex++;
             }
        });

        let errIndex = 0;
        this.errorEndpoint.options = '';
        this.errorEndpointOptions.forEach((errOption) => {
             if (errOption.key && errOption.value) {
                this.errorEndpoint.options += errIndex > 0 ? `,${errOption.key}=${errOption.value}` : `${errOption.key}=${errOption.value}`;
                errIndex++;
             }
        });
    }

    addOption(options: Array<Option>) {
        options.push({key: '', value: ''});
    }

    removeOption(options: Array<Option>, option: Option) {
        options.splice(options.indexOf(option), 1);
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
        this.setOptions();

        if (this.fromEndpoint.id !== undefined && this.errorEndpoint.id !== undefined && this.flow.id !== undefined) {

            this.toEndpoint.flowId = this.flow.id;

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
                    this.isSaving = false;
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

    goBack() {
        this.router.navigate(['flow']);
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

export class Option {
    constructor(
        public key?: string,
        public value?: string,
    ) { }
}
