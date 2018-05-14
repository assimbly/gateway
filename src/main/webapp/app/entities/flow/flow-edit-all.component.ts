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
    savingFlowFailed = false;
    savingFlowFailedMessage = 'Saving failed (check logs)';
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
    fromTypeAssimblyLink: string;
    fromTypeCamelLink: string;
    toTypeAssimblyLink: string;
    toTypeCamelLink: string;
    errorTypeAssimblyLink: string;
    errorTypeCamelLink: string;
    typesLinks: Array<TypeLinks>;

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
        this.typesLinks = [
            {
                name: 'ACTIVEMQ',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/activemq',
                camelTypeLink: ''
            },
            {
                name: 'FILE',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/file',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/camel-core/src/main/docs/file-component.adoc'
            },
            {
                name: 'HTTP4',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/http4',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/components/camel-http4/src/main/docs/http4-component.adoc'
            },
            {
                name: 'KAFKA',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/kafka',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/components/camel-kafka/src/main/docs/kafka-component.adoc'
            },
            {
                name: 'SFTP',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/sftp',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/components/camel-ftp/src/main/docs/sftp-component.adoc'
            },
            {
                name: 'SJMS',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/sjms',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/components/camel-sjms/src/main/docs/sjms-component.adoc'
            },
            {
                name: 'SONICMQ',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/sonicmq',
                camelTypeLink: ''
            },
            {
                name: 'SQL',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/sql',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/components/camel-sql/src/main/docs/sql-component.adoc'
            },
            {
                name: 'STREAM',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/stream',
                camelTypeLink: 'https://github.com/apache/camel/blob/master/components/camel-stream/src/main/docs/stream-component.adoc'
            },
            {
                name: 'WASTEBIN',
                assimblyTypeLink: 'https://github.com/assimbly/gateway/wiki/components/wastebin',
                camelTypeLink: ''
            }
        ]
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
                                this.setTypeLinks(this.fromEndpoint, null, null)
                                this.finished = true;
                            }
                        });
                    }
                }

                if (this.flow.errorEndpointId) {
                    this.errorEndpointService.find(this.flow.errorEndpointId).subscribe((errorEndpoint) => {
                        this.errorEndpoint = errorEndpoint;
                        this.getOptions(null, null, this.errorEndpoint);
                        this.setTypeLinks(null, null, this.errorEndpoint);
                    });
                }

                this.toEndpointService.findByFlowId(id).subscribe((toEndpoints) => {
                    this.toEndpoint = toEndpoints[0];
                    this.getOptions(null, this.toEndpoint, null);
                    this.setTypeLinks(null, this.toEndpoint, null);
                });

            });
        } else if (!this.finished) {
            setTimeout(() => {
                this.flow = new Flow();
                this.flow.autoStart = false;
                this.fromEndpoint = new FromEndpoint();
                this.toEndpoint = new ToEndpoint();
                this.errorEndpoint = new ErrorEndpoint();
                this.finished = true;
            }, 0);
        }
    }

    setTypeLinks(fromEndpoint?: FromEndpoint, toEndpoint?: ToEndpoint, errorEndpoint?: ErrorEndpoint) {
        let type;
        if (fromEndpoint !== null) {
            type = this.typesLinks.find((x) => x.name === fromEndpoint.type.toString());
            this.fromTypeAssimblyLink = type.assimblyTypeLink;
            this.fromTypeCamelLink = type.camelTypeLink;
        } else if (toEndpoint !== null) {
            type = this.typesLinks.find((x) => x.name === toEndpoint.type.toString());
            this.toTypeAssimblyLink = type.assimblyTypeLink;
            this.toTypeCamelLink = type.camelTypeLink;
        } else if (errorEndpoint !== null) {
            type = this.typesLinks.find((x) => x.name === errorEndpoint.type.toString());
            this.errorTypeAssimblyLink = type.assimblyTypeLink;
            this.errorTypeCamelLink = type.camelTypeLink;
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
                this.fromEndpoint.options += fromIndex > 0 ? `&${fromOption.key}=${fromOption.value}` : `${fromOption.key}=${fromOption.value}`;
                fromIndex++;
             }
        });

        let toIndex = 0;
        this.toEndpoint.options = '';
        this.toEndpointOptions.forEach((toOption) => {
             if (toOption.key && toOption.value) {
                this.toEndpoint.options += toIndex > 0 ? `&${toOption.key}=${toOption.value}` : `${toOption.key}=${toOption.value}`;
                toIndex++;
             }
        });

        let errIndex = 0;
        this.errorEndpoint.options = '';
        this.errorEndpointOptions.forEach((errOption) => {
             if (errOption.key && errOption.value) {
                this.errorEndpoint.options += errIndex > 0 ? `&${errOption.key}=${errOption.value}` : `${errOption.key}=${errOption.value}`;
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

    handleErrorWhileCreatingFlow(flowId?: number, fromEndpointId?: number, errorEndpointId?: number, toEndpointId?: number) {
        if (flowId !== null) { this.flowService.delete(flowId) };
        if (fromEndpointId !== null) { this.fromEndpointService.delete(fromEndpointId) };
        if (errorEndpointId !== null) { this.errorEndpointService.delete(errorEndpointId) };
        if (toEndpointId !== null) { this.toEndpointService.delete(toEndpointId) };
        this.savingFlowFailed = true;
        this.isSaving = false;
        console.log('flow not created');
    }

    save() {
        this.isSaving = true;
        this.setOptions();
        this.savingFlowFailed = false;

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
        } else {
            if (this.singleGateway) {
                this.flow.gatewayId = this.gateways[0].id;
            }
            this.flowService.create(this.flow)
                .subscribe((flowRes) => {
                    this.flow = flowRes;
                    this.fromEndpointService.create(this.fromEndpoint)
                        .subscribe((fromRes) => {
                            this.fromEndpoint = fromRes;
                            this.errorEndpointService.create(this.errorEndpoint)
                                .subscribe((errorRes) => {
                                    this.errorEndpoint = errorRes;
                                    this.flow.fromEndpointId = this.fromEndpoint.id;
                                    this.flow.errorEndpointId = this.errorEndpoint.id;
                                    this.flowService.update(this.flow)
                                        .subscribe((flowUpdated) => {
                                            this.flow = flowUpdated;
                                            this.toEndpoint.flowId = this.flow.id;
                                            this.toEndpointService.create(this.toEndpoint)
                                                .subscribe((toRes) => {
                                                    console.log('flow created');
                                                    this.finished = true;
                                                    this.isSaving = false;
                                                }, () => {
                                                    this.handleErrorWhileCreatingFlow(this.flow.id, this.fromEndpoint.id, this.errorEndpoint.id, null);
                                                });
                                        }, () => {
                                            this.handleErrorWhileCreatingFlow(this.flow.id, this.fromEndpoint.id, null, null);
                                        });
                                }, () => {
                                    this.handleErrorWhileCreatingFlow(this.flow.id, this.fromEndpoint.id, null, null);
                                });
                        }, () => {
                            this.handleErrorWhileCreatingFlow(this.flow.id, null, null, null);
                        });
                }, () => {
                    this.handleErrorWhileCreatingFlow(null, null, null, null);
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
        window.history.back();
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

export class TypeLinks {
    constructor(
        public name: string,
        public assimblyTypeLink: string,
        public camelTypeLink: string
    ) {}
}
