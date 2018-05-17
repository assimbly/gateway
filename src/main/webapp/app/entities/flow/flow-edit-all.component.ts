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
    toEndpointsOptions: Array<Array<Option>> = new Array<Array<Option>>([{key: '', value: ''}]);
    errorEndpoint: ErrorEndpoint;
    errorEndpointOptions: Array<Option> = new Array<Option>({key: '', value: ''});
    toEndpoints: ToEndpoint[] = new Array<ToEndpoint>();
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
    toTypeAssimblyLinks: Array<string> = new Array<string>();
    toTypeCamelLinks: Array<string> = new Array<string>();
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
        this.toEndpoints = [new ToEndpoint()];
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
        this.loadServices();
        this.loadHeaders();

        this.getGateways();

        if (id) {
            this.flowService.find(id).subscribe((flow) => {
                if (flow) {
                    this.flow = flow;
                    if (this.flow.fromEndpointId) {
                        this.fromEndpointService.find(this.flow.fromEndpointId).subscribe((fromEndpoint) => {
                            if (fromEndpoint) {
                                this.fromEndpoint = fromEndpoint;
                                this.getOptions([this.fromEndpoint]);
                                this.setTypeLinks([this.fromEndpoint])
                                this.finished = true;
                            }
                        });
                    }
                }

                if (this.flow.errorEndpointId) {
                    this.errorEndpointService.find(this.flow.errorEndpointId).subscribe((errorEndpoint) => {
                        this.errorEndpoint = errorEndpoint;
                        this.getOptions([this.errorEndpoint]);
                        this.setTypeLinks([this.errorEndpoint]);
                    });
                }

                this.toEndpointService.findByFlowId(id).subscribe((toEndpoints) => {
                    this.toEndpoints = toEndpoints.length === 0 ? [new ToEndpoint()] : toEndpoints;
                    this.getOptions(this.toEndpoints);
                    this.setTypeLinks(this.toEndpoints);
                });
            });
        } else if (!this.finished) {
            setTimeout(() => {
                this.flow = new Flow();
                this.flow.autoStart = false;
                this.fromEndpoint = new FromEndpoint();
                this.toEndpoints = new Array<ToEndpoint>(new ToEndpoint());
                this.errorEndpoint = new ErrorEndpoint();
                this.finished = true;
            }, 0);
        }
    }

    loadServices() {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
                this.serviceCreated = this.services.length > 0;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    loadHeaders() {
        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
                this.headerCreated = this.headers.length > 0;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    setTypeLinks(endpoints: Array<any>) {
        endpoints.forEach((endpoint) => {
            let type;
            if (endpoint instanceof FromEndpoint) {
                type = this.typesLinks.find((x) => x.name === endpoint.type.toString());
                this.fromTypeAssimblyLink = type.assimblyTypeLink;
                this.fromTypeCamelLink = type.camelTypeLink;
            } else if (endpoint instanceof ToEndpoint) {
                type = this.typesLinks.find((x) => x.name === endpoint.type.toString());
                this.toTypeAssimblyLinks[this.toEndpoints.indexOf(endpoint)] = type.assimblyTypeLink;
                this.toTypeCamelLinks[this.toEndpoints.indexOf(endpoint)] = type.camelTypeLink;
            } else if (endpoint instanceof ErrorEndpoint) {
                type = this.typesLinks.find((x) => x.name === endpoint.type.toString());
                this.errorTypeAssimblyLink = type.assimblyTypeLink;
                this.errorTypeCamelLink = type.camelTypeLink;
            }
        });
    }

    getOptions(endpoints: Array<any>) {
        endpoints.forEach((endpoint, i) => {
            if (endpoint.options === null) { return; }
            const options = endpoint.options.split('&');

            if (endpoint instanceof FromEndpoint) {
                this.fromEndpointOptions = new Array<Option>();
            } else if (endpoint instanceof ToEndpoint) {
                this.toEndpointsOptions[i] = new Array<Option>();
            } else if (endpoint instanceof ErrorEndpoint) {
                this.errorEndpointOptions = new Array<Option>();
            }

            options.forEach((option) => {
                const kv = option.split('=');
                const o = new Option();
                o.key = kv[0];
                o.value = kv[1];
                if (endpoint instanceof FromEndpoint) {
                    this.fromEndpointOptions.push(o);
                } else if (endpoint instanceof ToEndpoint) {
                    this.toEndpointsOptions[i].push(o);
                } else if (endpoint instanceof ErrorEndpoint) {
                    this.errorEndpointOptions.push(o);
                }
            });
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

        this.toEndpoints.forEach((toEndpoint, i) => {
            let toIndex = 0;
            toEndpoint.options = '';
            this.toEndpointsOptions[i].forEach((toOption) => {
                if (toOption.key && toOption.value) {
                    toEndpoint.options += toIndex > 0 ? `&${toOption.key}=${toOption.value}` : `${toOption.key}=${toOption.value}`;
                    toIndex++;
                }
            });
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

    addNewToEndpoint() {
        this.toEndpoints.push(new ToEndpoint());
        this.toEndpointsOptions.push(new Array<Option>({key: '', value: ''}));
    }

    removeToEndpoint(toEndpoint) {
        const i = this.toEndpoints.indexOf(toEndpoint);
        this.toEndpoints.splice(i, 1);
        this.toEndpointsOptions.splice(i, 1);
        if (typeof toEndpoint.id !== 'undefined') {
            this.toEndpointService.delete(toEndpoint.id)
                .subscribe((res) => {
                    const t = res;
                });
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

    createOrEditHeader(endpoint) {
        (typeof endpoint.headerId === 'undefined' || endpoint.headerId === null) ?
            this.router.navigate(['/', { outlets: { popup: ['header-new'] } }]) :
            this.router.navigate(['/', { outlets: { popup: 'header/' + endpoint.headerId + '/edit'} }]);

        this.eventManager.subscribe(
            'headerModified',
            (res) => this.setHeader(endpoint, res)
        );
    }

    createOrEditService(endpoint) {
        (typeof endpoint.serviceId === 'undefined' || endpoint.serviceId === null) ?
            this.router.navigate(['/', { outlets: { popup: ['service-new'] } }]) :
            this.router.navigate(['/', { outlets: { popup: 'service/' + endpoint.serviceId + '/edit'} }]);

        this.eventManager.subscribe(
            'serviceModified',
            (res) => this.setService(endpoint, res)
        );
    }

    setHeader(endpoint, id) {
        this.headerService.query().subscribe(
            (res: ResponseWrapper) => {
                this.headers = res.json;
                this.headerCreated = this.headers.length > 0;
                endpoint.headerId = this.headers.find((h) => h.id === id.content).id;
            },
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    setService(endpoint, id) {
        this.serviceService.query().subscribe(
            (res: ResponseWrapper) => {
                this.services = res.json;
                this.serviceCreated = this.services.length > 0;
                endpoint.serviceId = this.services.find((s) => s.id === id.content).id;
            },
            (res: ResponseWrapper) => this.onError(res.json)
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

            this.toEndpoints.forEach((toEndpoint) => {
                toEndpoint.flowId = this.flow.id;
            })

            const updateFlow = this.fromEndpointService.update(this.fromEndpoint);
            const updateFromEndpoint = this.errorEndpointService.update(this.errorEndpoint);
            const updateErrorEndpoint = this.flowService.update(this.flow);
            const updateToEndpoints = this.toEndpointService.updateMultiple(this.toEndpoints);

            forkJoin([updateFlow, updateFromEndpoint, updateErrorEndpoint, updateToEndpoints]).subscribe((results) => {
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
                                            this.toEndpoints.forEach((toEndpoint) => {
                                                toEndpoint.flowId = this.flow.id;
                                            });
                                            this.toEndpointService.createMultiple(this.toEndpoints)
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
