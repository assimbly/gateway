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
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { FormatWidth } from '@angular/common';

@Component({
    selector: 'jhi-flow-edit-all',
    templateUrl: './flow-edit-all.component.html'
})
export class FlowEditAllComponent implements OnInit, OnDestroy {

    flow: Flow;
    fromEndpoint: FromEndpoint;
    fromEndpointOptions: Array<Option> = [];
    toEndpointsOptions: Array<Array<Option>> = [[]];
    errorEndpoint: ErrorEndpoint;
    errorEndpointOptions: Array<Option> = [];
    toEndpoints: ToEndpoint[] = new Array<ToEndpoint>();
    services: Service[];
    headers: Header[];
    isSaving: boolean;
    savingFlowFailed = false;
    savingFlowFailedMessage = 'Saving failed (check logs)';
    savingFlowSuccess = false;
    savingFlowSuccessMessage = 'Flow successfully saved';
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
    fromUriPlaceholder: string;
    toTypeAssimblyLinks: Array<string> = new Array<string>();
    toTypeCamelLinks: Array<string> = new Array<string>();
    errorTypeAssimblyLink: string;
    errorTypeCamelLink: string;
    typesLinks: Array<TypeLinks>;
    editFlowForm: FormGroup;

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
                    this.initializeForm(this.flow);
                    if (this.flow.fromEndpointId) {
                        this.fromEndpointService.find(this.flow.fromEndpointId).subscribe((fromEndpoint) => {
                            if (fromEndpoint) {
                                this.fromEndpoint = fromEndpoint;
                                (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.fromEndpoint));
                                this.getOptions(this.fromEndpoint, this.editFlowForm.controls.endpointsData.get('0'), this.fromEndpointOptions);
                                this.setTypeLinks(this.fromEndpoint);
                                this.finished = true;
                            }
                        });
                    }
                }

                if (this.flow.errorEndpointId) {
                    this.errorEndpointService.find(this.flow.errorEndpointId).subscribe((errorEndpoint) => {
                        this.errorEndpoint = errorEndpoint;
                        (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.errorEndpoint));
                        this.getOptions(this.errorEndpoint, this.editFlowForm.controls.endpointsData.get('1'), this.errorEndpointOptions);
                        this.setTypeLinks(this.errorEndpoint);
                    });
                }

                this.toEndpointService.findByFlowId(id).subscribe((toEndpoints) => {
                    this.toEndpoints = toEndpoints.length === 0 ? [new ToEndpoint()] : toEndpoints;
                    this.toEndpoints.forEach((toEndpoint, i) => {
                        if (typeof this.toEndpointsOptions[i] === 'undefined') {
                            this.toEndpointsOptions.push([]);
                        }
                        (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(toEndpoint));
                        this.getOptions(toEndpoint, this.editFlowForm.controls.endpointsData.get((i + 2).toString()), this.toEndpointsOptions[i]);
                        this.setTypeLinks(toEndpoint);
                    });
                });
            });
        } else if (!this.finished) {
            setTimeout(() => {
                this.flow = new Flow();
                this.flow.autoStart = false;
                this.initializeForm(this.flow);
                this.fromEndpoint = new FromEndpoint();
                (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.fromEndpoint));
                this.fromEndpointOptions = [new Option()];
                this.errorEndpoint = new ErrorEndpoint();
                (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.errorEndpoint));
                this.errorEndpointOptions = [new Option()];
                this.toEndpoints = new Array<ToEndpoint>(new ToEndpoint());
                (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(this.toEndpoints[0]));
                this.toEndpointsOptions = [[new Option()]];
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

    setTypeLinks(endpoint: any, e?: Event) {

        if (typeof e !== 'undefined') {
            endpoint.type = e;
        }
        const wikiDocUrl = this.flowService.getWikiDocUrl();
        const camelDocUrl = this.flowService.getCamelDocUrl();

        forkJoin([wikiDocUrl, camelDocUrl]).subscribe((results) => {

            const wiki = results[0].text();
            const camel = results[1].text();

            const typesLinks = [
                {
                    name: 'ACTIVEMQ',
                    assimblyTypeLink: `${wiki}/component-activemq`,
                    camelTypeLink: `${camel}/components/camel-jms/src/main/docs/jms-component.adoc`,
                    uriPlaceholder: '[queue:|topic:]destinationName'
                },
                {
                    name: 'FILE',
                    assimblyTypeLink: `${wiki}/component-file`,
                    camelTypeLink: `${camel}/camel-core/src/main/docs/file-component.adoc`,
                    uriPlaceholder: 'directoryName'
                },
                {
                    name: 'HTTP4',
                    assimblyTypeLink: `${wiki}/component-http4`,
                    camelTypeLink: `${camel}/components/camel-http4/src/main/docs/http4-component.adoc`,
                    uriPlaceholder: 'hostname[:port][/resourceUri]'
                },
                {
                    name: 'KAFKA',
                    assimblyTypeLink: `${wiki}/component-kafka`,
                    camelTypeLink: `${camel}/components/camel-kafka/src/main/docs/kafka-component.adoc`,
                    uriPlaceholder: 'topic'
                },
                {
                    name: 'SFTP',
                    assimblyTypeLink: `${wiki}/component-sftp`,
                    camelTypeLink: `${camel}/components/camel-ftp/src/main/docs/sftp-component.adoc`,
                    uriPlaceholder: 'host:port/directoryName'
                },
                {
                    name: 'SJMS',
                    assimblyTypeLink: `${wiki}/component-sjms`,
                    camelTypeLink: `${camel}/components/camel-sjms/src/main/docs/sjms-component.adoc`,
                    uriPlaceholder: '[queue:|topic:]destinationName'
                },
                {
                    name: 'SONICMQ',
                    assimblyTypeLink: `${wiki}/component-sonicmq`,
                    camelTypeLink: `${camel}/components/camel-sjms/src/main/docs/sjms-component.adoc`,
                    uriPlaceholder: '[queue:|topic:]destinationName'
                },
                {
                    name: 'SQL',
                    assimblyTypeLink: `${wiki}/component-sql`,
                    camelTypeLink: `${camel}/components/camel-sql/src/main/docs/sql-component.adoc`,
                    uriPlaceholder: 'select * from table where id=# order by name'
                },
                {
                    name: 'STREAM',
                    assimblyTypeLink: `${wiki}/component-stream`,
                    camelTypeLink: `${camel}/components/camel-stream/src/main/docs/stream-component.adoc`,
                    uriPlaceholder: 'kind'
                },
                {
                    name: 'WASTEBIN',
                    assimblyTypeLink: `${wiki}/component-wastebin`,
                    camelTypeLink:  `${camel}/camel-core/src/main/docs/mock-component.adoc`,
                    uriPlaceholder: 'someName'
                }
            ]

            let type;
            if (endpoint instanceof FromEndpoint) {
                type = typesLinks.find((x) => x.name === endpoint.type.toString());
                this.fromTypeAssimblyLink = type.assimblyTypeLink;
                this.fromTypeCamelLink = type.camelTypeLink;
                this.fromUriPlaceholder = type.uriPlaceholder;
            } else if (endpoint instanceof ToEndpoint) {
                type = typesLinks.find((x) => x.name === endpoint.type.toString());
                this.toTypeAssimblyLinks[this.toEndpoints.indexOf(endpoint)] = type.assimblyTypeLink;
                this.toTypeCamelLinks[this.toEndpoints.indexOf(endpoint)] = type.camelTypeLink;
            } else if (endpoint instanceof ErrorEndpoint) {
                type = typesLinks.find((x) => x.name === endpoint.type.toString());
                this.errorTypeAssimblyLink = type.assimblyTypeLink;
                this.errorTypeCamelLink = type.camelTypeLink;
            }
        });
    }

    initializeForm(flow: Flow) {
        this.editFlowForm = new FormGroup({
            'id': new FormControl(flow.id),
            'name': new FormControl(flow.name, Validators.required),
            'autoStart': new FormControl(flow.autoStart),
            'gateway': new FormControl(flow.gatewayId),
            'endpointsData': new FormArray([])
        });
    }

    initializeEndpointData(endpoint?: any): FormGroup {
        return new FormGroup({
            'id': new FormControl(endpoint.id),
            'type': new FormControl(endpoint.type, Validators.required),
            'uri': new FormControl(endpoint.uri, Validators.required),
            'options': new FormArray([
                this.initializeOption()
            ]),
            'service': new FormControl(endpoint.serviceId),
            'header': new FormControl(endpoint.headerId)
        })
    }

    initializeOption(): FormGroup {
        return new FormGroup({
            'key': new FormControl(null, Validators.required),
            'value': new FormControl(null, Validators.required)
        })
    }

    getOptions(endpoint: any, endpointForm: any, endpointOptions: Array<Option>) {
        if (endpoint.options === null) { return; }
        const options = endpoint.options.split('&');

        options.forEach((option, index) => {
            const kv = option.split('=');
            const o = new Option();
            o.key = kv[0];
            o.value = kv[1];
            if (typeof endpointForm.controls.options.controls[index] === 'undefined') {
                endpointForm.controls.options.push(
                    this.initializeOption()
                )
            }

            endpointForm.controls.options.controls[index].patchValue({
                'key': o.key,
                'value': o.value
            })

            if (endpoint instanceof FromEndpoint) {
                endpointOptions.push(o);
            } else if (endpoint instanceof ToEndpoint) {
                endpointOptions.push(o);
            } else if (endpoint instanceof ErrorEndpoint) {
                endpointOptions.push(o);
            }
        });
    }

    setOptions() {
        this.fromEndpoint.options = '';
        this.setEndpointOptions(this.fromEndpointOptions, this.fromEndpoint, this.selectOptions(0));

        this.toEndpoints.forEach((toEndpoint, i) => {
            toEndpoint.options = '';
            this.setEndpointOptions(this.toEndpointsOptions[i], toEndpoint, this.selectOptions(i + 2));
        });

        this.errorEndpoint.options = '';
        this.setEndpointOptions(this.errorEndpointOptions, this.errorEndpoint, this.selectOptions(1));
    }

    setEndpointOptions(endpointOptions: Array<Option>, endpoint, formOptions: FormArray) {
        let index = 0;
        endpointOptions.forEach((option, i) => {
            option.key = (<FormGroup>formOptions.controls[i]).controls.key.value;
            option.value = (<FormGroup>formOptions.controls[i]).controls.value.value;
            if (option.key && option.value) {
                endpoint.options += index > 0 ? `&${option.key}=${option.value}` : `${option.key}=${option.value}`;
                index++;
            }
        });
    }

    addOption(options: Array<Option>, endpointIndex) {
        this.selectOptions(endpointIndex).push(this.initializeOption());
        options.push(new Option());
    }

    removeOption(options: Array<Option>, option: Option, endpointIndex) {
        const index = options.indexOf(option);
        let formOptions = this.selectOptions(endpointIndex);
        formOptions.removeAt(index);
        options.splice(index, 1);
    }

    selectOptions(endpointIndex): FormArray {
        const endpointData = (<FormArray>this.editFlowForm.controls.endpointsData).controls[endpointIndex];
        return (<FormArray>(<FormGroup>endpointData).controls.options);
    }

    addNewToEndpoint() {
        this.toEndpoints.push(new ToEndpoint());
        this.toEndpointsOptions.push([new Option()]);

        const toEndpoint = this.toEndpoints.find((e, i) => i === this.toEndpoints.length - 1);
        (<FormArray>this.editFlowForm.controls.endpointsData).push(this.initializeEndpointData(toEndpoint));
    }

    removeToEndpoint(toEndpoint, endpointDataName) {
        const i = this.toEndpoints.indexOf(toEndpoint);
        this.toEndpoints.splice(i, 1);
        this.toEndpointsOptions.splice(i, 1);
        this.editFlowForm.removeControl(endpointDataName);
        (<FormArray>this.editFlowForm.controls.endpointsData).removeAt(i + 2);
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
        this.setDataFromForm();
        this.setOptions();
        this.savingFlowFailed = false;
        this.savingFlowSuccess = false;

        if (!!this.fromEndpoint.id && !!this.errorEndpoint.id && !!this.flow.id) {

            this.toEndpoints.forEach((toEndpoint) => {
                toEndpoint.flowId = this.flow.id;
            })

            const updateFlow = this.flowService.update(this.flow);
            const updateFromEndpoint = this.fromEndpointService.update(this.fromEndpoint);
            const updateErrorEndpoint = this.errorEndpointService.update(this.errorEndpoint);
            const updateToEndpoints = this.toEndpointService.updateMultiple(this.toEndpoints);

            forkJoin([updateFlow, updateFromEndpoint, updateErrorEndpoint, updateToEndpoints]).subscribe((results) => {

                const te: Array<ToEndpoint> = results[3];
                this.toEndpointService.findByFlowId(results[0].id).subscribe((toEndpoints) => {
                    toEndpoints = toEndpoints.filter((e) => {
                        let s = te.find((t) => t.id === e.id);
                        if (typeof s === 'undefined') {
                            return true;
                        } else {
                            return s.id !== e.id;
                        }
                    });

                    if (toEndpoints.length > 0) {
                        toEndpoints.forEach((element) => {
                            this.toEndpointService.delete(element.id).subscribe((r) => {
                                const y = r;
                            }, (err) => {
                                const e = err;
                            });
                        });
                    }
                });
                this.savingFlowSuccess = true;
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
                                                    this.savingFlowSuccess = true;
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

    setDataFromForm() {
        const flowControls = this.editFlowForm.controls;
        this.flow.id = flowControls.id.value;
        this.flow.name = flowControls.name.value;
        this.flow.autoStart = flowControls.autoStart.value;
        this.flow.gatewayId = flowControls.gateway.value;

        (<FormArray>flowControls.endpointsData).controls.forEach((endpoint, index) => {
            if (index === 0) {
                this.setDataFromFormOnEndpoint(this.fromEndpoint, (<FormGroup>endpoint).controls);
            } else if (index === 1) {
                this.setDataFromFormOnEndpoint(this.errorEndpoint, (<FormGroup>endpoint).controls);
            } else if (index > 1) {
                this.setDataFromFormOnEndpoint(this.toEndpoints[index - 2], (<FormGroup>endpoint).controls);
            }
        });
    }

    setDataFromFormOnEndpoint(endpoint, formEndpointData) {
        endpoint.id = formEndpointData.id.value;
        endpoint.type = formEndpointData.type.value;
        endpoint.uri = formEndpointData.uri.value;
        endpoint.serviceId = formEndpointData.service.value;
        endpoint.headerId = formEndpointData.header.value;
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
